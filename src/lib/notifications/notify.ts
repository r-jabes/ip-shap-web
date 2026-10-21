import { sendNewOrderStaffEmail } from "@/lib/notifications/email";
import { notifyOrderEvent } from "@/lib/notifications/log";
import type { StoredOrder } from "@/lib/orders/store";

/**
 * Log + optional staff email after a successful place-order.
 * Email failures are logged; the order remains committed.
 */
export async function notifyNewOrder(order: StoredOrder): Promise<void> {
  notifyOrderEvent({
    templateId: "order_awaiting_confirmation",
    orderReference: order.reference,
    idempotencyKey: `order-created-${order.id}`,
    variables: { channel: order.channel },
  });

  const email = await sendNewOrderStaffEmail(order);
  if (!email.ok) {
    console.error(
      JSON.stringify({
        type: "notification_email_error",
        orderReference: order.reference,
        error: email.error,
      }),
    );
  } else if (email.skipped) {
    console.info(
      JSON.stringify({
        type: "notification_email_skipped",
        orderReference: order.reference,
        reason: email.skipped,
      }),
    );
  }
}
