import { describe, expect, it } from "vitest";
import {
  paymentStatusFromSandboxEvent,
  sandboxWebhookEventSchema,
  signSandboxWebhook,
  verifySandboxWebhookSignature,
} from "./sandbox";

describe("frontend sandbox webhook helpers", () => {
  const secret = "test-webhook-secret-16";
  const body = JSON.stringify({
    id: "evt_1",
    type: "payment.paid",
    orderId: "22222222-2222-4222-8222-222222222001",
    attemptId: "att_1",
    amountRwf: 12000,
    occurredAt: "2026-10-19T12:00:00.000Z",
  });

  it("rejects forged signatures", () => {
    expect(verifySandboxWebhookSignature(body, "forged", secret)).toBe(false);
    expect(verifySandboxWebhookSignature(body, null, secret)).toBe(false);
  });

  it("accepts valid signatures and maps statuses", () => {
    const sig = signSandboxWebhook(body, secret);
    expect(verifySandboxWebhookSignature(body, sig, secret)).toBe(true);
    const event = sandboxWebhookEventSchema.parse(JSON.parse(body));
    expect(paymentStatusFromSandboxEvent(event.type)).toBe("paid");
  });
});
