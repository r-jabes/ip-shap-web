import * as webpush from "web-push";
import { getPublicEnv } from "@/lib/env";
import { formatRwf } from "@/lib/money";
import { getWebPushConfig } from "@/lib/notifications/push/config";
import type { StaffPushPayload } from "@/lib/notifications/push/types";
import { getPushSubscriptionStore } from "@/lib/notifications/push/subscriptions";
import type { StoredOrder } from "@/lib/orders/store";

const SEND_CONCURRENCY = 10;

export type PushSendSummary = {
  attempted: number;
  delivered: number;
  removed: number;
  failed: number;
};

function isGoneStatus(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410;
}

function statusFromError(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof statusCode === "number" ? statusCode : undefined;
}

/** Build a compact staff payload (well under the ~4KB push limit). */
export function buildNewOrderPushPayload(order: StoredOrder): StaffPushPayload {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return {
    title: "New order",
    body: `${order.reference} · ${formatRwf(order.total.amount)}`,
    url: `${base}/admin/orders/${order.id}`,
    tag: `order-${order.id}`,
  };
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;
  const limit = Math.max(1, concurrency);
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      await worker(items[current]!);
    }
  });
  await Promise.all(runners);
}

/**
 * Fan-out a visible notification to every active staff device subscription.
 * Dead endpoints (404/410) are deleted. Empty subscription list is a successful skip.
 */
export async function sendWebPushToStaff(
  payload: StaffPushPayload,
): Promise<{ ok: true; skipped?: string; summary: PushSendSummary } | { ok: false; error: string }> {
  const config = getWebPushConfig();
  if (!config) {
    return {
      ok: true,
      skipped: "web_push_not_configured",
      summary: { attempted: 0, delivered: 0, removed: 0, failed: 0 },
    };
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);

  const store = getPushSubscriptionStore();
  const subscriptions = await store.listAllActive();
  if (subscriptions.length === 0) {
    return {
      ok: true,
      skipped: "no_subscriptions",
      summary: { attempted: 0, delivered: 0, removed: 0, failed: 0 },
    };
  }

  const body = JSON.stringify(payload);
  const summary: PushSendSummary = {
    attempted: subscriptions.length,
    delivered: 0,
    removed: 0,
    failed: 0,
  };

  await mapPool(subscriptions, SEND_CONCURRENCY, async (subscription) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        body,
        {
          TTL: 60 * 60,
          urgency: "high",
          headers: {},
        },
      );
      summary.delivered += 1;
    } catch (error) {
      const status = statusFromError(error);
      if (isGoneStatus(status)) {
        await store.deleteByEndpoint(subscription.endpoint);
        summary.removed += 1;
        return;
      }
      summary.failed += 1;
    }
  });

  // Partial device failures should not retry the whole fan-out forever when some delivered.
  if (summary.delivered === 0 && summary.failed > 0 && summary.removed === 0) {
    return { ok: false, error: `all_push_sends_failed:${summary.failed}` };
  }

  return { ok: true, summary };
}

export async function sendNewOrderStaffPush(
  order: StoredOrder,
): Promise<{ ok: true; skipped?: string } | { ok: false; error: string }> {
  const result = await sendWebPushToStaff(buildNewOrderPushPayload(order));
  if (!result.ok) return result;
  return result.skipped
    ? { ok: true, skipped: result.skipped }
    : { ok: true };
}
