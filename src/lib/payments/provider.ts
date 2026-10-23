import { getServerEnv } from "@/lib/env";
import { createSandboxPaymentProvider } from "@/lib/payments/sandbox-provider";
import type { PaymentProvider } from "@/lib/payments/types";

export type { PaymentEvent, PaymentProvider } from "@/lib/payments/types";
export { PaymentWebhookError } from "@/lib/payments/types";

/** The configured provider, or null while online payments are not set up. */
export function getPaymentProvider(): PaymentProvider | null {
  const env = getServerEnv();
  switch (env.PAYMENT_PROVIDER) {
    case "sandbox":
      return createSandboxPaymentProvider(env.PAYMENT_WEBHOOK_SECRET);
    default:
      return null;
  }
}
