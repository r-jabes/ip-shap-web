import { randomUUID } from "node:crypto";
import { normalizePhone, isValidCheckoutPhone } from "@/lib/orders/phone";
import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/** Requests nobody acted on are dropped after this long; answered ones after a month. */
export const RESTOCK_WAITING_RETENTION_DAYS = 180;
export const RESTOCK_DONE_RETENTION_DAYS = 30;

export type RestockContactKind = "email" | "phone";

export type RestockRequest = {
  id: string;
  productId: string;
  kind: RestockContactKind;
  contact: string;
  createdAt: string;
  notifiedAt: string | null;
};

export type ParsedContact = { kind: RestockContactKind; contact: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Accepts an email or a phone number and returns it in one clean form, or null if it is neither. */
export function parseRestockContact(raw: string): ParsedContact | null {
  const value = raw.trim();
  if (!value || value.length > 200) return null;
  if (value.includes("@")) {
    return EMAIL_PATTERN.test(value)
      ? { kind: "email", contact: value.toLowerCase() }
      : null;
  }
  return isValidCheckoutPhone(value)
    ? { kind: "phone", contact: normalizePhone(value) }
    : null;
}

export interface RestockStore {
  add(productId: string, contact: ParsedContact, now: Date): Promise<"added" | "exists">;
  listWaiting(options?: { productId?: string; kind?: RestockContactKind; limit?: number }): Promise<RestockRequest[]>;
  markNotified(ids: string[], now: Date): Promise<void>;
  purge(now: Date): Promise<number>;
}

export function createMemoryRestockStore(): RestockStore & { rows: RestockRequest[] } {
  const rows: RestockRequest[] = [];
  return {
    rows,
    async add(productId, contact, now) {
      if (rows.some((row) => row.productId === productId && row.contact === contact.contact)) {
        return "exists";
      }
      rows.push({
        id: randomUUID(),
        productId,
        kind: contact.kind,
        contact: contact.contact,
        createdAt: now.toISOString(),
        notifiedAt: null,
      });
      return "added";
    },
    async listWaiting(options = {}) {
      return rows
        .filter(
          (row) =>
            row.notifiedAt === null &&
            (!options.productId || row.productId === options.productId) &&
            (!options.kind || row.kind === options.kind),
        )
        .slice(0, options.limit ?? 500);
    },
    async markNotified(ids, now) {
      for (const row of rows) {
        if (ids.includes(row.id)) row.notifiedAt = now.toISOString();
      }
    },
    async purge(now) {
      const day = 24 * 60 * 60 * 1000;
      const waitingCutoff = now.getTime() - RESTOCK_WAITING_RETENTION_DAYS * day;
      const doneCutoff = now.getTime() - RESTOCK_DONE_RETENTION_DAYS * day;
      const keep = rows.filter((row) =>
        row.notifiedAt
          ? new Date(row.notifiedAt).getTime() >= doneCutoff
          : new Date(row.createdAt).getTime() >= waitingCutoff,
      );
      const removed = rows.length - keep.length;
      rows.length = 0;
      rows.push(...keep);
      return removed;
    },
  };
}

type Row = {
  id: string;
  product_id: string;
  kind: RestockContactKind;
  contact: string;
  created_at: string;
  notified_at: string | null;
};

function fromRow(row: Row): RestockRequest {
  return {
    id: row.id,
    productId: row.product_id,
    kind: row.kind,
    contact: row.contact,
    createdAt: row.created_at,
    notifiedAt: row.notified_at,
  };
}

function createSupabaseRestockStore(): RestockStore {
  const client = () => getSupabaseServiceClient()!;
  return {
    async add(productId, contact) {
      const { data, error } = await client()
        .from("restock_requests")
        .upsert(
          { product_id: productId, kind: contact.kind, contact: contact.contact },
          { onConflict: "product_id,contact", ignoreDuplicates: true },
        )
        .select("id");
      if (error) throw new Error(error.message);
      return (data ?? []).length > 0 ? "added" : "exists";
    },
    async listWaiting(options = {}) {
      let query = client()
        .from("restock_requests")
        .select("id, product_id, kind, contact, created_at, notified_at")
        .is("notified_at", null)
        .order("created_at", { ascending: true })
        .limit(options.limit ?? 500);
      if (options.productId) query = query.eq("product_id", options.productId);
      if (options.kind) query = query.eq("kind", options.kind);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return ((data ?? []) as Row[]).map(fromRow);
    },
    async markNotified(ids, now) {
      if (ids.length === 0) return;
      const { error } = await client()
        .from("restock_requests")
        .update({ notified_at: now.toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    },
    async purge(now) {
      const day = 24 * 60 * 60 * 1000;
      const waitingCutoff = new Date(now.getTime() - RESTOCK_WAITING_RETENTION_DAYS * day);
      const doneCutoff = new Date(now.getTime() - RESTOCK_DONE_RETENTION_DAYS * day);
      const done = await client()
        .from("restock_requests")
        .delete()
        .not("notified_at", "is", null)
        .lt("notified_at", doneCutoff.toISOString())
        .select("id");
      if (done.error) throw new Error(done.error.message);
      const stale = await client()
        .from("restock_requests")
        .delete()
        .is("notified_at", null)
        .lt("created_at", waitingCutoff.toISOString())
        .select("id");
      if (stale.error) throw new Error(stale.error.message);
      return (done.data ?? []).length + (stale.data ?? []).length;
    },
  };
}

let memoryStore: ReturnType<typeof createMemoryRestockStore> | undefined;
let storeOverride: RestockStore | undefined;

export function getRestockStore(): RestockStore {
  if (storeOverride) return storeOverride;
  if (hasDurableStorage()) return createSupabaseRestockStore();
  memoryStore ??= createMemoryRestockStore();
  return memoryStore;
}

export function setRestockStoreForTests(store: RestockStore | undefined) {
  storeOverride = store;
  memoryStore = undefined;
}
