import type {
  DeliveryResult,
  NotificationChannel,
  NotificationChannelId,
  OutboxMessage,
} from "@/lib/notifications/channel";
import {
  sendBackInStockEmail,
  sendLowStockStaffEmail,
  sendNewOrderStaffEmail,
} from "@/lib/notifications/email";
import type { StockLine } from "@/lib/notifications/templates/low-stock";
import { getOrderByIdDurable } from "@/lib/orders/durable";

const emailChannel: NotificationChannel = {
  id: "email",
  async deliver(message: OutboxMessage): Promise<DeliveryResult> {
    if (message.kind === "staff_new_order") {
      const orderId = String(message.payload.orderId ?? "");
      const order = orderId ? await getOrderByIdDurable(orderId) : undefined;
      if (!order) return { ok: true, skipped: "order_not_found" };
      const result = await sendNewOrderStaffEmail(order);
      if (!result.ok) return { ok: false, error: result.error };
      return result.skipped ? { ok: true, skipped: result.skipped } : { ok: true };
    }
    if (message.kind === "staff_low_stock") {
      const lines = (key: string): StockLine[] =>
        Array.isArray(message.payload[key])
          ? (message.payload[key] as StockLine[])
          : [];
      const result = await sendLowStockStaffEmail({
        soldOut: lines("soldOut"),
        low: lines("low"),
        entityRefId: message.dedupeKey,
      });
      if (!result.ok) return { ok: false, error: result.error };
      return result.skipped ? { ok: true, skipped: result.skipped } : { ok: true };
    }
    if (message.kind === "customer_back_in_stock") {
      const email = String(message.payload.email ?? "");
      const slug = String(message.payload.slug ?? "");
      if (!email || !slug) return { ok: true, skipped: "missing_details" };
      const result = await sendBackInStockEmail({
        to: email,
        productName: String(message.payload.productName ?? "Your drink"),
        slug,
        entityRefId: message.dedupeKey,
      });
      if (!result.ok) return { ok: false, error: result.error };
      return result.skipped ? { ok: true, skipped: result.skipped } : { ok: true };
    }
    return { ok: true, skipped: "unknown_kind" };
  },
};

const channels: Partial<Record<NotificationChannelId, NotificationChannel>> = {
  email: emailChannel,
  // whatsapp / sms: register here once online payments exist and the client opts in.
};

export function getChannel(id: NotificationChannelId) {
  return channels[id];
}
