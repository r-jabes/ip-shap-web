import { logger } from "@/lib/logger";
import { sendNewOrderStaffEmail } from "@/lib/notifications/email";
import { notifyOrderEvent } from "@/lib/notifications/log";
import {
  enqueueNotification,
  processDueNotifications,
} from "@/lib/notifications/outbox";
import type { StoredOrder } from "@/lib/orders/store";

/**
 * Queues staff "new order" email + web push and tries to send them straight away.
 *
 * Both go through the outbox, so a failed send is retried later instead of being lost.
 * Nothing here may fail the order — it is already saved by the time this runs.
 */
export async function notifyNewOrder(order: StoredOrder): Promise<void> {
  notifyOrderEvent({
    templateId: "order_awaiting_confirmation",
    orderReference: order.reference,
    idempotencyKey: `order-created-${order.id}`,
    variables: { channel: order.channel },
  });

  try {
    await enqueueNotification({
      channel: "email",
      kind: "staff_new_order",
      dedupeKey: `staff_new_order:${order.id}`,
      payload: { orderId: order.id },
    });
    await enqueueNotification({
      channel: "web_push",
      kind: "staff_new_order",
      dedupeKey: `staff_new_order:push:${order.id}`,
      payload: { orderId: order.id },
    });
    await processDueNotifications({ limit: 10 });
  } catch (error) {
    // The outbox itself is unavailable (for example its table is not created yet): send email
    // directly so the team still hears about the order. Push waits until the outbox is healthy.
    logger.warn("Notification outbox unavailable, sending email directly", {
      orderReference: order.reference,
      reason: error instanceof Error ? error.message : "unknown",
    });
    const email = await sendNewOrderStaffEmail(order);
    if (!email.ok) {
      logger.error("Staff email failed", {
        orderReference: order.reference,
        error: email.error,
      });
    }
  }
}
