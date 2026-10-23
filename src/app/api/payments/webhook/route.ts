import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { notifyOrderEvent } from "@/lib/notifications/log";
import { applyPaymentEventDurable } from "@/lib/orders/durable";
import { getPaymentProvider } from "@/lib/payments/provider";
import { PaymentWebhookError } from "@/lib/payments/types";

const MAX_BODY_BYTES = 64_000;

/**
 * Payment provider webhooks. The configured `PaymentProvider` proves the call is genuine; this
 * route only applies the resulting event. Never treat a browser redirect as payment confirmation.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  if (!provider) {
    return NextResponse.json(
      { error: "Online payments are not configured" },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let event;
  try {
    event = provider.parseWebhook(rawBody, request.headers);
  } catch (error) {
    if (error instanceof PaymentWebhookError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.httpStatus },
      );
    }
    throw error;
  }

  try {
    const { order, duplicate } = await applyPaymentEventDurable(
      provider.id,
      event,
    );
    if (!duplicate && event.status === "paid") {
      notifyOrderEvent({
        templateId: "payment_received",
        orderReference: order.reference,
        idempotencyKey: `notif-paid-${event.id}`,
        variables: { paymentStatus: event.status },
      });
    }
    return NextResponse.json({
      ok: true,
      duplicate,
      paymentStatus: order.paymentStatus,
      mode: provider.mode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed";
    logger.error("Payment webhook could not be applied", {
      provider: provider.id,
      eventId: event.id,
      error: message,
    });
    return NextResponse.json(
      { error: message },
      { status: message === "Order not found" ? 404 : 500 },
    );
  }
}
