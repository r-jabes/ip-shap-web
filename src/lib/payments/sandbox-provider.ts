import {
  paymentStatusFromSandboxEvent,
  sandboxWebhookEventSchema,
  verifySandboxWebhookSignature,
} from "@/lib/payments/sandbox";
import {
  PaymentWebhookError,
  type PaymentEvent,
  type PaymentProvider,
} from "@/lib/payments/types";

/** Test-only provider driven by signed JSON events. Never presented to customers as live. */
export function createSandboxPaymentProvider(
  secret: string | undefined,
): PaymentProvider {
  return {
    id: "sandbox",
    mode: "sandbox",
    parseWebhook(rawBody, headers): PaymentEvent {
      if (!secret) {
        throw new PaymentWebhookError("Webhook secret not configured", 503);
      }
      const signature = headers.get("x-ipshap-sandbox-signature");
      if (!verifySandboxWebhookSignature(rawBody, signature, secret)) {
        throw new PaymentWebhookError("Invalid signature", 401);
      }
      let event;
      try {
        event = sandboxWebhookEventSchema.parse(JSON.parse(rawBody));
      } catch {
        throw new PaymentWebhookError("Invalid payload", 400);
      }
      return {
        id: event.id,
        orderId: event.orderId,
        status: paymentStatusFromSandboxEvent(event.type),
        amountRwf: event.amountRwf,
      };
    },
  };
}
