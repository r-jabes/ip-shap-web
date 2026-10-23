import { describe, expect, it } from "vitest";
import { signSandboxWebhook } from "@/lib/payments/sandbox";
import { createSandboxPaymentProvider } from "@/lib/payments/sandbox-provider";
import { PaymentWebhookError } from "@/lib/payments/types";

const secret = "test-secret-0123456789";
const body = JSON.stringify({
  id: "evt_1",
  type: "payment.paid",
  orderId: "11111111-1111-4111-8111-111111111111",
  attemptId: "att_1",
  amountRwf: 15000,
  occurredAt: "2026-10-23T10:00:00.000Z",
});

function headersFor(signature: string) {
  return new Headers({ "x-ipshap-sandbox-signature": signature });
}

describe("sandbox payment provider", () => {
  const provider = createSandboxPaymentProvider(secret);

  it("turns a correctly signed webhook into a provider-neutral payment event", () => {
    const event = provider.parseWebhook(
      body,
      headersFor(signSandboxWebhook(body, secret)),
    );
    expect(event).toEqual({
      id: "evt_1",
      orderId: "11111111-1111-4111-8111-111111111111",
      status: "paid",
      amountRwf: 15000,
    });
    expect(provider.mode).toBe("sandbox");
  });

  it("rejects a webhook with a wrong signature", () => {
    expect(() => provider.parseWebhook(body, headersFor("nope"))).toThrow(
      PaymentWebhookError,
    );
  });

  it("rejects a signed but malformed payload", () => {
    const bad = JSON.stringify({ hello: "world" });
    expect(() =>
      provider.parseWebhook(bad, headersFor(signSandboxWebhook(bad, secret))),
    ).toThrow(/Invalid payload/);
  });

  it("refuses every webhook when no secret is configured", () => {
    const unconfigured = createSandboxPaymentProvider(undefined);
    expect(() => unconfigured.parseWebhook(body, headersFor("x"))).toThrow(
      /not configured/,
    );
  });
});
