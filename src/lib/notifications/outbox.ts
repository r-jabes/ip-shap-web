import { randomUUID } from "node:crypto";
import { logger } from "@/lib/logger";
import type {
  NotificationChannelId,
  NotificationKind,
  OutboxMessage,
} from "@/lib/notifications/channel";
import { hasDurableStorage } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/** Minutes to wait after the 1st, 2nd, 3rd... failed attempt. */
const RETRY_DELAYS_MIN = [1, 5, 30, 120, 360] as const;
export const MAX_ATTEMPTS = RETRY_DELAYS_MIN.length + 1;
/** A message stuck "processing" this long (e.g. the server stopped mid-send) goes back in the queue. */
const STUCK_AFTER_MS = 10 * 60 * 1000;
/** Sent and skipped rows are kept this long for troubleshooting, then deleted. */
export const OUTBOX_RETENTION_DAYS = 30;

export type NewNotification = {
  channel: NotificationChannelId;
  kind: NotificationKind;
  /** Same key = same notification; queuing it twice is a no-op. */
  dedupeKey: string;
  payload: Record<string, unknown>;
};

export function retryDelayMs(attemptsSoFar: number): number | null {
  const minutes = RETRY_DELAYS_MIN[attemptsSoFar - 1];
  return minutes === undefined ? null : minutes * 60 * 1000;
}

/** Storage behind the outbox, so the queue logic is the same in memory and in Supabase. */
export interface OutboxStore {
  insert(row: NewNotification, now: Date): Promise<boolean>;
  claimDue(limit: number, now: Date): Promise<OutboxMessage[]>;
  markDone(id: string, now: Date, skipped?: string): Promise<void>;
  markRetry(id: string, error: string, nextAt: Date | null): Promise<void>;
  requeueStuck(olderThan: Date): Promise<void>;
  purgeFinished(before: Date): Promise<number>;
}

type MemoryRow = NewNotification & {
  id: string;
  status: "pending" | "processing" | "sent" | "skipped" | "failed";
  attempts: number;
  nextAttemptAt: Date;
  updatedAt: Date;
};

export function createMemoryOutboxStore(): OutboxStore & { rows: MemoryRow[] } {
  const rows: MemoryRow[] = [];
  const toMessage = (row: MemoryRow): OutboxMessage => ({
    id: row.id,
    channel: row.channel,
    kind: row.kind,
    dedupeKey: row.dedupeKey,
    payload: row.payload,
    attempts: row.attempts,
  });
  return {
    rows,
    async insert(row, now) {
      if (rows.some((existing) => existing.dedupeKey === row.dedupeKey)) {
        return false;
      }
      rows.push({
        ...row,
        id: randomUUID(),
        status: "pending",
        attempts: 0,
        nextAttemptAt: now,
        updatedAt: now,
      });
      return true;
    },
    async claimDue(limit, now) {
      const due = rows
        .filter((row) => row.status === "pending" && row.nextAttemptAt <= now)
        .slice(0, limit);
      for (const row of due) {
        row.status = "processing";
        row.attempts += 1;
        row.updatedAt = now;
      }
      return due.map(toMessage);
    },
    async markDone(id, now, skipped) {
      const row = rows.find((entry) => entry.id === id);
      if (row) {
        row.status = skipped ? "skipped" : "sent";
        row.updatedAt = now;
      }
    },
    async markRetry(id, _error, nextAt) {
      const row = rows.find((entry) => entry.id === id);
      if (!row) return;
      if (nextAt) {
        row.status = "pending";
        row.nextAttemptAt = nextAt;
      } else {
        row.status = "failed";
      }
      row.updatedAt = new Date();
    },
    async requeueStuck(olderThan) {
      for (const row of rows) {
        if (row.status === "processing" && row.updatedAt < olderThan) {
          row.status = "pending";
        }
      }
    },
    async purgeFinished(before) {
      const keep = rows.filter(
        (row) =>
          !(
            (row.status === "sent" || row.status === "skipped") &&
            row.updatedAt < before
          ),
      );
      const removed = rows.length - keep.length;
      rows.length = 0;
      rows.push(...keep);
      return removed;
    },
  };
}

function createSupabaseOutboxStore(): OutboxStore {
  const client = () => getSupabaseServiceClient()!;
  return {
    async insert(row, now) {
      const { data, error } = await client()
        .from("notification_outbox")
        .upsert(
          {
            channel: row.channel,
            kind: row.kind,
            dedupe_key: row.dedupeKey,
            payload: row.payload,
            next_attempt_at: now.toISOString(),
          },
          { onConflict: "dedupe_key", ignoreDuplicates: true },
        )
        .select("id");
      if (error) throw new Error(error.message);
      return (data ?? []).length > 0;
    },
    async claimDue(limit, now) {
      const { data, error } = await client()
        .from("notification_outbox")
        .select("id")
        .eq("status", "pending")
        .lte("next_attempt_at", now.toISOString())
        .order("next_attempt_at", { ascending: true })
        .limit(limit);
      if (error) throw new Error(error.message);

      const claimed: OutboxMessage[] = [];
      for (const { id } of data ?? []) {
        // Conditional update: if another worker got there first, nothing is returned.
        const { data: row, error: claimError } = await client()
          .from("notification_outbox")
          .update({ status: "processing", updated_at: now.toISOString() })
          .eq("id", id)
          .eq("status", "pending")
          .select("id, channel, kind, dedupe_key, payload, attempts")
          .maybeSingle();
        if (claimError || !row) continue;
        const attempts = (row.attempts as number) + 1;
        await client()
          .from("notification_outbox")
          .update({ attempts })
          .eq("id", id);
        claimed.push({
          id: row.id as string,
          channel: row.channel as NotificationChannelId,
          kind: row.kind as NotificationKind,
          dedupeKey: row.dedupe_key as string,
          payload: (row.payload ?? {}) as Record<string, unknown>,
          attempts,
        });
      }
      return claimed;
    },
    async markDone(id, now, skipped) {
      const { error } = await client()
        .from("notification_outbox")
        .update({
          status: skipped ? "skipped" : "sent",
          last_error: skipped ?? null,
          sent_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    async markRetry(id, message, nextAt) {
      const { error } = await client()
        .from("notification_outbox")
        .update({
          status: nextAt ? "pending" : "failed",
          last_error: message.slice(0, 500),
          next_attempt_at: (nextAt ?? new Date()).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    async requeueStuck(olderThan) {
      await client()
        .from("notification_outbox")
        .update({ status: "pending" })
        .eq("status", "processing")
        .lt("updated_at", olderThan.toISOString());
    },
    async purgeFinished(before) {
      const { data, error } = await client()
        .from("notification_outbox")
        .delete()
        .in("status", ["sent", "skipped"])
        .lt("updated_at", before.toISOString())
        .select("id");
      if (error) throw new Error(error.message);
      return (data ?? []).length;
    },
  };
}

let memoryStore: ReturnType<typeof createMemoryOutboxStore> | undefined;
let storeOverride: OutboxStore | undefined;

export function getOutboxStore(): OutboxStore {
  if (storeOverride) return storeOverride;
  if (hasDurableStorage()) return createSupabaseOutboxStore();
  memoryStore ??= createMemoryOutboxStore();
  return memoryStore;
}

export function setOutboxStoreForTests(store: OutboxStore | undefined) {
  storeOverride = store;
  memoryStore = undefined;
}

/** Queues a notification. Returns false when the same one was already queued. */
export async function enqueueNotification(
  notification: NewNotification,
  now = new Date(),
): Promise<boolean> {
  return getOutboxStore().insert(notification, now);
}

export type ProcessSummary = {
  sent: number;
  skipped: number;
  retried: number;
  failed: number;
};

/**
 * Sends everything that is due. Safe to call often and from several places at once: each
 * message is claimed before it is sent, so it goes out once. Failures are rescheduled with a
 * growing delay and finally marked failed (and logged) after {@link MAX_ATTEMPTS} tries.
 */
export async function processDueNotifications(
  options: { limit?: number; now?: Date } = {},
): Promise<ProcessSummary> {
  const { getChannel } = await import("@/lib/notifications/channels");
  const store = getOutboxStore();
  const now = options.now ?? new Date();
  const summary: ProcessSummary = { sent: 0, skipped: 0, retried: 0, failed: 0 };

  await store.requeueStuck(new Date(now.getTime() - STUCK_AFTER_MS));
  const due = await store.claimDue(options.limit ?? 20, now);

  for (const message of due) {
    const channel = getChannel(message.channel);
    let error: string | null = null;
    let skipped: string | undefined;

    if (!channel) {
      skipped = "channel_unavailable";
    } else {
      try {
        const result = await channel.deliver(message);
        if (result.ok) skipped = result.skipped;
        else error = result.error;
      } catch (caught) {
        error = caught instanceof Error ? caught.message : "Send failed";
      }
    }

    if (error === null) {
      await store.markDone(message.id, now, skipped);
      if (skipped) summary.skipped += 1;
      else summary.sent += 1;
      continue;
    }

    const delay = retryDelayMs(message.attempts);
    await store.markRetry(
      message.id,
      error,
      delay === null ? null : new Date(now.getTime() + delay),
    );
    if (delay === null) {
      summary.failed += 1;
      logger.error("Notification could not be delivered after several tries", {
        kind: message.kind,
        channel: message.channel,
        dedupeKey: message.dedupeKey,
        error,
      });
    } else {
      summary.retried += 1;
      logger.warn("Notification failed, will retry", {
        kind: message.kind,
        attempts: message.attempts,
        error,
      });
    }
  }
  return summary;
}

/** Deletes delivered notifications older than the retention period. */
export async function purgeOldNotifications(now = new Date()): Promise<number> {
  const cutoff = new Date(
    now.getTime() - OUTBOX_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  return getOutboxStore().purgeFinished(cutoff);
}
