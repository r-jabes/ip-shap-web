import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  DeliveryResult,
  NotificationChannel,
} from "@/lib/notifications/channel";

const deliver = vi.fn<NotificationChannel["deliver"]>();
let channelAvailable = true;

vi.mock("@/lib/notifications/channels", () => ({
  getChannel: () => (channelAvailable ? { id: "email", deliver } : undefined),
}));

import {
  createMemoryOutboxStore,
  enqueueNotification,
  MAX_ATTEMPTS,
  processDueNotifications,
  purgeOldNotifications,
  retryDelayMs,
  setOutboxStoreForTests,
} from "./outbox";

const base = {
  channel: "email" as const,
  kind: "staff_new_order" as const,
  payload: { orderId: "o1" },
};
const minute = 60 * 1000;

describe("notification outbox", () => {
  let store: ReturnType<typeof createMemoryOutboxStore>;

  beforeEach(() => {
    store = createMemoryOutboxStore();
    setOutboxStoreForTests(store);
    deliver.mockReset();
    channelAvailable = true;
  });

  it("queues the same notification only once", async () => {
    expect(await enqueueNotification({ ...base, dedupeKey: "a" })).toBe(true);
    expect(await enqueueNotification({ ...base, dedupeKey: "a" })).toBe(false);
    expect(store.rows).toHaveLength(1);
  });

  it("sends a queued notification and does not send it again", async () => {
    deliver.mockResolvedValue({ ok: true });
    await enqueueNotification({ ...base, dedupeKey: "a" });

    expect(await processDueNotifications()).toMatchObject({ sent: 1 });
    expect(await processDueNotifications()).toMatchObject({ sent: 0 });
    expect(deliver).toHaveBeenCalledTimes(1);
    expect(store.rows[0].status).toBe("sent");
  });

  it("records a skipped notification (for example email not configured) without retrying", async () => {
    deliver.mockResolvedValue({ ok: true, skipped: "not_configured" });
    await enqueueNotification({ ...base, dedupeKey: "a" });

    expect(await processDueNotifications()).toMatchObject({ skipped: 1 });
    expect(store.rows[0].status).toBe("skipped");
  });

  it("retries a failed send later, then succeeds", async () => {
    const t0 = new Date("2026-10-23T10:00:00Z");
    deliver
      .mockResolvedValueOnce({ ok: false, error: "Resend 500" })
      .mockResolvedValueOnce({ ok: true });
    await enqueueNotification({ ...base, dedupeKey: "a" }, t0);

    expect(await processDueNotifications({ now: t0 })).toMatchObject({
      retried: 1,
    });
    // Not due yet.
    expect(
      await processDueNotifications({ now: new Date(t0.getTime() + 30_000) }),
    ).toMatchObject({ sent: 0, retried: 0 });
    // Due after the first back-off (1 minute).
    expect(
      await processDueNotifications({ now: new Date(t0.getTime() + minute) }),
    ).toMatchObject({ sent: 1 });
  });

  it("treats a thrown error like a failed send", async () => {
    deliver.mockRejectedValue(new Error("network"));
    await enqueueNotification({ ...base, dedupeKey: "a" });
    expect(await processDueNotifications()).toMatchObject({ retried: 1 });
  });

  it("gives up after the maximum number of attempts", async () => {
    deliver.mockResolvedValue({ ok: false, error: "nope" } as DeliveryResult);
    let now = new Date("2026-10-23T10:00:00Z");
    await enqueueNotification({ ...base, dedupeKey: "a" }, now);

    let last = { failed: 0 };
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      last = await processDueNotifications({ now });
      now = new Date(now.getTime() + 24 * 60 * minute);
    }
    expect(last.failed).toBe(1);
    expect(store.rows[0].status).toBe("failed");
    expect(deliver).toHaveBeenCalledTimes(MAX_ATTEMPTS);
  });

  it("marks a notification skipped when its channel is not enabled yet", async () => {
    channelAvailable = false;
    await enqueueNotification({
      ...base,
      channel: "whatsapp",
      dedupeKey: "a",
    });
    expect(await processDueNotifications()).toMatchObject({ skipped: 1 });
  });

  it("puts a message stuck mid-send back in the queue", async () => {
    const t0 = new Date("2026-10-23T10:00:00Z");
    await enqueueNotification({ ...base, dedupeKey: "a" }, t0);
    await store.claimDue(10, t0); // worker claims it, then dies

    deliver.mockResolvedValue({ ok: true });
    const later = new Date(t0.getTime() + 30 * minute);
    expect(await processDueNotifications({ now: later })).toMatchObject({
      sent: 1,
    });
  });

  it("deletes delivered notifications after 30 days but keeps recent and failed ones", async () => {
    deliver.mockResolvedValue({ ok: true });
    const old = new Date("2026-08-01T10:00:00Z");
    await enqueueNotification({ ...base, dedupeKey: "old" }, old);
    await processDueNotifications({ now: old });
    const recent = new Date("2026-10-20T10:00:00Z");
    await enqueueNotification({ ...base, dedupeKey: "recent" }, recent);
    await processDueNotifications({ now: recent });

    const removed = await purgeOldNotifications(new Date("2026-10-23T10:00:00Z"));
    expect(removed).toBe(1);
    expect(store.rows.map((row) => row.dedupeKey)).toEqual(["recent"]);
  });

  it("backs off for longer after each failure", () => {
    expect(retryDelayMs(1)).toBe(1 * minute);
    expect(retryDelayMs(2)).toBe(5 * minute);
    expect(retryDelayMs(MAX_ATTEMPTS)).toBeNull();
  });
});
