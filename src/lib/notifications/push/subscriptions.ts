import { randomUUID } from "node:crypto";
import type { ValidatedPushSubscription } from "@/lib/notifications/push/endpoint";
import type { StoredPushSubscription } from "@/lib/notifications/push/types";
import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type UpsertPushSubscriptionInput = ValidatedPushSubscription & {
  adminUserId: string;
  userAgent?: string | null;
};

export interface PushSubscriptionStore {
  upsert(input: UpsertPushSubscriptionInput, now?: Date): Promise<StoredPushSubscription>;
  /** Soft-disable (or remove) a subscription owned by this admin. Returns false if not found. */
  disableForAdmin(
    adminUserId: string,
    endpoint: string,
    now?: Date,
  ): Promise<boolean>;
  listActiveByAdmin(adminUserId: string): Promise<StoredPushSubscription[]>;
  listAllActive(): Promise<StoredPushSubscription[]>;
  /** Hard-delete by endpoint after push service returns 404/410 (any owner). */
  deleteByEndpoint(endpoint: string): Promise<boolean>;
}

type MemoryRow = StoredPushSubscription;

function toStored(row: {
  id: string;
  admin_user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  disabled_at: string | null;
}): StoredPushSubscription {
  return {
    id: row.id,
    adminUserId: row.admin_user_id,
    endpoint: row.endpoint,
    p256dh: row.p256dh,
    auth: row.auth,
    userAgent: row.user_agent,
    createdAt: row.created_at,
    lastSeenAt: row.last_seen_at,
    disabledAt: row.disabled_at,
  };
}

export function createMemoryPushSubscriptionStore(): PushSubscriptionStore & {
  rows: MemoryRow[];
} {
  const rows: MemoryRow[] = [];

  return {
    rows,
    async upsert(input, now = new Date()) {
      const iso = now.toISOString();
      const existing = rows.find((row) => row.endpoint === input.endpoint);
      if (existing) {
        existing.adminUserId = input.adminUserId;
        existing.p256dh = input.p256dh;
        existing.auth = input.auth;
        existing.userAgent = input.userAgent ?? existing.userAgent;
        existing.lastSeenAt = iso;
        existing.disabledAt = null;
        return { ...existing };
      }
      const created: MemoryRow = {
        id: randomUUID(),
        adminUserId: input.adminUserId,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent ?? null,
        createdAt: iso,
        lastSeenAt: iso,
        disabledAt: null,
      };
      rows.push(created);
      return { ...created };
    },
    async disableForAdmin(adminUserId, endpoint, now = new Date()) {
      const row = rows.find(
        (entry) =>
          entry.endpoint === endpoint &&
          entry.adminUserId === adminUserId &&
          entry.disabledAt === null,
      );
      if (!row) return false;
      row.disabledAt = now.toISOString();
      return true;
    },
    async listActiveByAdmin(adminUserId) {
      return rows
        .filter(
          (row) => row.adminUserId === adminUserId && row.disabledAt === null,
        )
        .map((row) => ({ ...row }));
    },
    async listAllActive() {
      return rows
        .filter((row) => row.disabledAt === null)
        .map((row) => ({ ...row }));
    },
    async deleteByEndpoint(endpoint) {
      const index = rows.findIndex((row) => row.endpoint === endpoint);
      if (index < 0) return false;
      rows.splice(index, 1);
      return true;
    },
  };
}

function createSupabasePushSubscriptionStore(): PushSubscriptionStore {
  const client = () => {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      throw new Error("Supabase service client is not configured");
    }
    return supabase;
  };

  return {
    async upsert(input, now = new Date()) {
      const iso = now.toISOString();
      const { data, error } = await client()
        .from("push_subscriptions")
        .upsert(
          {
            admin_user_id: input.adminUserId,
            endpoint: input.endpoint,
            p256dh: input.p256dh,
            auth: input.auth,
            user_agent: input.userAgent ?? null,
            last_seen_at: iso,
            disabled_at: null,
          },
          { onConflict: "endpoint" },
        )
        .select(
          "id, admin_user_id, endpoint, p256dh, auth, user_agent, created_at, last_seen_at, disabled_at",
        )
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to upsert push subscription");
      }
      return toStored(data);
    },

    async disableForAdmin(adminUserId, endpoint, now = new Date()) {
      const { data, error } = await client()
        .from("push_subscriptions")
        .update({ disabled_at: now.toISOString() })
        .eq("endpoint", endpoint)
        .eq("admin_user_id", adminUserId)
        .is("disabled_at", null)
        .select("id")
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      return Boolean(data);
    },

    async listActiveByAdmin(adminUserId) {
      const { data, error } = await client()
        .from("push_subscriptions")
        .select(
          "id, admin_user_id, endpoint, p256dh, auth, user_agent, created_at, last_seen_at, disabled_at",
        )
        .eq("admin_user_id", adminUserId)
        .is("disabled_at", null);

      if (error) throw new Error(error.message);
      return (data ?? []).map(toStored);
    },

    async listAllActive() {
      const { data, error } = await client()
        .from("push_subscriptions")
        .select(
          "id, admin_user_id, endpoint, p256dh, auth, user_agent, created_at, last_seen_at, disabled_at",
        )
        .is("disabled_at", null);

      if (error) throw new Error(error.message);
      return (data ?? []).map(toStored);
    },

    async deleteByEndpoint(endpoint) {
      const { data, error } = await client()
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint)
        .select("id")
        .maybeSingle();

      if (error) throw new Error(error.message);
      return Boolean(data);
    },
  };
}

let storeOverride: PushSubscriptionStore | undefined;

export function setPushSubscriptionStoreForTests(
  store: PushSubscriptionStore | undefined,
) {
  storeOverride = store;
}

export function getPushSubscriptionStore(): PushSubscriptionStore {
  if (storeOverride) return storeOverride;
  if (hasDurableStorage()) return createSupabasePushSubscriptionStore();
  return createMemoryPushSubscriptionStore();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Real Auth user ids only — bootstrap:… sessions cannot own push rows (FK to auth.users). */
export function isPersistableAdminUserId(userId: string): boolean {
  return UUID_RE.test(userId);
}
