"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateCatalogueStock } from "@/lib/catalogue/cache";
import { isDocumentId } from "@/lib/document-id";
import { notifyNewOrder } from "@/lib/notifications/notify";
import type { FulfilmentStatus, PaymentStatus } from "@/lib/orders/transitions";
import {
  createOrderDurable,
  lookupOrderByPhoneDurable,
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
  const limit = await consumeRateLimit(`checkout:${ip}`, 20, 15 * 60 * 1000);
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
    const fulfillmentRaw = String(formData.get("fulfillmentMethod") ?? "");
    const fulfillmentMethod =
      fulfillmentRaw === "pickup" ? "pickup" : "delivery";

    order = await createOrderDurable({
      channel,
      fulfillmentMethod,
      items,
      customerName: String(formData.get("customerName") ?? ""),
      customerPhone: String(formData.get("customerPhone") ?? ""),
      customerNotes: String(formData.get("customerNotes") ?? "") || undefined,
      deliveryDistrict:
        fulfillmentMethod === "pickup"
          ? undefined
          : String(formData.get("deliveryDistrict") ?? "") || undefined,
      deliverySector:
        fulfillmentMethod === "pickup"
          ? undefined
          : String(formData.get("deliverySector") ?? "") || undefined,
      deliveryCell:
        fulfillmentMethod === "pickup"
          ? undefined
          : String(formData.get("deliveryCell") ?? "") || undefined,
      deliveryVillage:
        fulfillmentMethod === "pickup"
          ? undefined
          : String(formData.get("deliveryVillage") ?? "") || undefined,
      deliveryDirections:
        fulfillmentMethod === "pickup"
          ? undefined
          : String(formData.get("deliveryDirections") ?? "") || undefined,
      deliveryInstructions:
        fulfillmentMethod === "pickup"
          ? undefined
          : String(formData.get("deliveryInstructions") ?? "") || undefined,
      deliveryZoneId:
        fulfillmentMethod === "pickup"
          ? undefined
          : String(formData.get("deliveryZoneId") ?? "") || undefined,
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

const LOOKUP_NOT_FOUND =
  "We could not find an order with those details. Check the reference and try again, or message us and we will help.";

export async function lookupOrderAction(formData: FormData): Promise<void> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = await consumeRateLimit(`order-lookup:${ip}`, 30, 15 * 60 * 1000);
  if (!limit.ok) {
    redirect(
      `/order/lookup?error=${encodeURIComponent("Too many attempts. Please wait and try again.")}`,
    );
  }

  const reference = String(formData.get("reference") ?? "").trim().toUpperCase();
  const token = String(formData.get("token") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!reference) {
    redirect(
      `/order/lookup?error=${encodeURIComponent("Enter your order reference.")}`,
    );
  }
  if (!isDocumentId(reference, "order")) {
    redirect(
      `/order/lookup?error=${encodeURIComponent("That does not look like an order reference. It starts with IPS- and is about 20 characters long.")}`,
    );
  }
  if (!token && !phone) {
    redirect(
      `/order/lookup?error=${encodeURIComponent("Enter the phone number you ordered with, or your private token.")}`,
    );
  }

  let order;
  if (token) {
    order = await lookupOrderDurable(reference, token);
  } else {
    // Phone guesses are limited per reference as well, so one order cannot be brute-forced.
    const perReference = await consumeRateLimit(
      `order-lookup-phone:${reference}`,
      8,
      15 * 60 * 1000,
    );
    if (!perReference.ok) {
      redirect(
        `/order/lookup?error=${encodeURIComponent("Too many attempts for this order. Please wait a few minutes or message us.")}`,
      );
    }
    order = await lookupOrderByPhoneDurable(reference, phone);
  }
  if (!order) {
    redirect(`/order/lookup?error=${encodeURIComponent(LOOKUP_NOT_FOUND)}`);
  }
  redirect(
    `/order/${encodeURIComponent(order.reference)}?token=${encodeURIComponent(order.lookupToken)}`,
  );
}

export type RememberedOrderStatus = {
  reference: string;
  /** False when the order no longer exists (the device can forget it). */
  found: boolean;
  fulfilmentStatus?: FulfilmentStatus;
  paymentStatus?: PaymentStatus;
  items?: Array<{ productId: string; name: string; quantity: number }>;
};

/**
 * Current status for the few orders this device remembers. Each one must present its own private
 * token, so this reveals nothing the shopper could not already see on the confirmation page.
 */
export async function rememberedOrderStatusesAction(
  entries: Array<{ reference: string; token: string }>,
): Promise<RememberedOrderStatus[]> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = await consumeRateLimit(`order-status:${ip}`, 30, 15 * 60 * 1000);
  if (!limit.ok) return [];

  const results: RememberedOrderStatus[] = [];
  for (const entry of entries.slice(0, 5)) {
    const reference = String(entry.reference ?? "");
    const token = String(entry.token ?? "");
    try {
      const order = await lookupOrderDurable(reference, token);
      results.push(
        order
          ? {
              reference,
              found: true,
              fulfilmentStatus: order.fulfilmentStatus,
              paymentStatus: order.paymentStatus,
              items: order.items.map((item) => ({
                productId: item.productId,
                name: item.productName,
                quantity: item.quantity,
              })),
            }
          : { reference, found: false },
      );
    } catch {
      // A temporary problem must not make the device forget the order: report nothing for it.
    }
  }
  return results;
}

function fieldErrorsFromMessage(message: string): Record<string, string> {
  const lower = message.toLowerCase();
  if (lower.includes("phone")) return { customerPhone: message };
  if (lower.includes("name")) return { customerName: message };
  if (lower.includes("delivery zone")) return { deliveryZoneId: message };
  return {};
}
