import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const sandboxWebhookEventSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "payment.pending",
    "payment.paid",
    "payment.failed",
    "payment.cancelled",
    "payment.refunded",
  ]),
  orderId: z.string().uuid(),
  attemptId: z.string().min(1),
  amountRwf: z.number().int().nonnegative(),
  occurredAt: z.string().datetime(),
});

export type SandboxWebhookEvent = z.infer<typeof sandboxWebhookEventSchema>;

export function signSandboxWebhook(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifySandboxWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = signSandboxWebhook(rawBody, secret);
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function paymentStatusFromSandboxEvent(
  type: SandboxWebhookEvent["type"],
): "pending" | "paid" | "failed" | "cancelled" | "refunded" {
  switch (type) {
    case "payment.pending":
      return "pending";
    case "payment.paid":
      return "paid";
    case "payment.failed":
      return "failed";
    case "payment.cancelled":
      return "cancelled";
    case "payment.refunded":
      return "refunded";
  }
}
