import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { notifyOrderEvent } from "@/lib/notifications/log";
import {
  paymentStatusFromSandboxEvent,
  sandboxWebhookEventSchema,
  verifySandboxWebhookSignature,
} from "@/lib/payments/sandbox";
import {
  applyPaymentStatusFromWebhook,
  getOrderById,
} from "@/lib/orders/store";

/**
 * Sandbox payment webhooks only.
 * Never treat an unauthenticated browser redirect as payment confirmation.
 */
export async function POST(request: Request) {
  const env = getServerEnv();
  const secret = env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 64_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const rawBody = await request.text();
  if (rawBody.length > 64_000) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const signature = request.headers.get("x-ipshap-sandbox-signature");
  if (!verifySandboxWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = sandboxWebhookEventSchema.parse(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const status = paymentStatusFromSandboxEvent(event.type);
  try {
    const { order, duplicate } = applyPaymentStatusFromWebhook(
      event.orderId,
      status,
      event.id,
    );
    if (!duplicate && status === "paid") {
      notifyOrderEvent({
        templateId: "payment_received",
        orderReference: order.reference,
        idempotencyKey: `notif-paid-${event.id}`,
        variables: { paymentStatus: status },
      });
    }
    const current = getOrderById(event.orderId);
    return NextResponse.json({
      ok: true,
      duplicate,
      paymentStatus: current?.paymentStatus ?? status,
      mode: "sandbox",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
