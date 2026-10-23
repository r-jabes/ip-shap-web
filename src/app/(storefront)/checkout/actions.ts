"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateCatalogueStock } from "@/lib/catalogue/cache";
import { notifyNewOrder } from "@/lib/notifications/notify";
import {
  createOrderDurable,
  lookupOrderDurable,
  toOrderSummary,
} from "@/lib/orders/durable";
import type { CheckoutChannel } from "@/lib/orders/store";
import { initiateOrderPayment } from "@/lib/payments/initiate";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export type CheckoutActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function placeOrderAction(
  _prev: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = consumeRateLimit(`checkout:${ip}`, 20, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: "Too many attempts. Please wait and try again." };
  }

  const turnstile = await verifyTurnstileToken(
    String(formData.get("cf-turnstile-response") ?? ""),
    ip,
  );
  if (!turnstile.ok) {
    return {
      error:
        turnstile.reason === "missing_token"
          ? "Please complete the bot check and try again."
          : "Bot check failed. Refresh the page and try again.",
    };
  }

  const channel = String(formData.get("channel") ?? "") as CheckoutChannel;
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  const itemsJson = String(formData.get("itemsJson") ?? "[]");

  let items: Array<{ productId: string; quantity: number }> = [];
  try {
    items = JSON.parse(itemsJson) as Array<{
      productId: string;
      quantity: number;
    }>;
  } catch {
    return { error: "Cart data was invalid. Return to cart and try again." };
  }

  let order;
  try {
    order = await createOrderDurable({
      channel,
      items,
      customerName: String(formData.get("customerName") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      customerNotes: String(formData.get("customerNotes") ?? "") || undefined,
      deliveryDistrict:
        String(formData.get("deliveryDistrict") ?? "") || undefined,
      deliverySector: String(formData.get("deliverySector") ?? "") || undefined,
      deliveryCell: String(formData.get("deliveryCell") ?? "") || undefined,
      deliveryVillage:
        String(formData.get("deliveryVillage") ?? "") || undefined,
      deliveryDirections:
        String(formData.get("deliveryDirections") ?? "") || undefined,
      deliveryInstructions:
        String(formData.get("deliveryInstructions") ?? "") || undefined,
      deliveryZoneId: String(formData.get("deliveryZoneId") ?? "") || undefined,
      idempotencyKey,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not place order.";
    return {
      error: message,
      fieldErrors: fieldErrorsFromMessage(message),
    };
  }

  // Stock was just reserved: drop cached catalogue copies so server-rendered pages catch up.
  revalidateCatalogueStock();

  // Order is committed — email failures must not undo it.
  try {
    await notifyNewOrder(order);
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "notification_error",
        orderReference: order.reference,
        error: error instanceof Error ? error.message : "unknown",
      }),
    );
  }

  const summary = toOrderSummary(order);
  let confirmPath = `/order/${encodeURIComponent(summary.reference)}?token=${encodeURIComponent(summary.lookupToken)}`;

  if (order.channel === "online_payment") {
    try {
      const payment = initiateOrderPayment(order);
      if (payment?.redirectUrl) {
        order.paymentStatus = "pending";
        confirmPath = payment.redirectUrl.replace(/^https?:\/\/[^/]+/, "");
      }
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Could not start payment.",
      };
    }
  }

  redirect(confirmPath);
}

export async function lookupOrderAction(formData: FormData): Promise<void> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = consumeRateLimit(`order-lookup:${ip}`, 30, 15 * 60 * 1000);
  if (!limit.ok) {
    redirect(
      `/order/lookup?error=${encodeURIComponent("Too many attempts. Please wait and try again.")}`,
    );
  }

  const reference = String(formData.get("reference") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const order = await lookupOrderDurable(reference, token);
  if (!order) {
    redirect(`/order/lookup?error=${encodeURIComponent("Order not found.")}`);
  }
  redirect(
    `/order/${encodeURIComponent(order.reference)}?token=${encodeURIComponent(order.lookupToken)}`,
  );
}

function fieldErrorsFromMessage(message: string): Record<string, string> {
  const lower = message.toLowerCase();
  if (lower.includes("phone")) return { customerPhone: message };
  if (lower.includes("name")) return { customerName: message };
  if (lower.includes("delivery zone")) return { deliveryZoneId: message };
  return {};
}
