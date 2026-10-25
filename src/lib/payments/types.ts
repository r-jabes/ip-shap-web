import type { PaymentStatus } from "@/lib/orders/transitions";

/**
 * Everything the shop needs from an online payment company, and nothing company-specific.
 *
 * To add a real provider (MTN MoMo, Airtel Money, a card gateway...), implement `PaymentProvider`
 * in its own file, return it from `getPaymentProvider` (provider.ts), and turn on
 * `ONLINE_PAYMENT_ENABLED`. Orders already track the amount paid and a payment status, and the
 * webhook route, idempotency and notifications are provider-agnostic, so no other code changes.
 */
export type PaymentEvent = {
  /** The provider's unique id for this event — used so a repeated delivery is applied once. */
  id: string;
  orderId: string;
  status: Extract<
    PaymentStatus,
    "pending" | "paid" | "failed" | "cancelled" | "refunded"
  >;
  /** Amount in RWF the provider reports. */
  amountRwf: number;
};

export class PaymentWebhookError extends Error {
  constructor(
    message: string,
    readonly httpStatus: 400 | 401 | 413 | 503,
  ) {
    super(message);
    this.name = "PaymentWebhookError";
  }
}

export interface PaymentProvider {
  /** Stable id stored with every payment event, e.g. "sandbox", "mtn_momo". */
  readonly id: string;
  /** Only `live` providers may be shown to customers as real payment. */
  readonly mode: "sandbox" | "live";
  /**
   * Checks the webhook really came from the provider and turns it into a {@link PaymentEvent}.
   * Throws {@link PaymentWebhookError} (bad signature, bad payload, not configured).
   */
  parseWebhook(rawBody: string, headers: Headers): PaymentEvent;
}
