import { randomUUID } from "node:crypto";
import { getPublicEnv, getServerEnv } from "@/lib/env";
import type { StoredOrder } from "@/lib/orders/store";

export type SandboxInitiateResult = {
  provider: "sandbox";
  attemptId: string;
  status: "pending";
  mode: "sandbox";
  redirectUrl: string;
};

/**
 * Server-side payment initiation. Live providers are blocked until selected.
 * Sandbox redirects are labelled sandbox and are never proof of payment.
 */
export function initiateOrderPayment(
  order: StoredOrder,
): SandboxInitiateResult | null {
  const env = getServerEnv();
  if (order.channel !== "online_payment") return null;
  if (!env.ONLINE_PAYMENT_ENABLED) {
    throw new Error("Online payment is not enabled.");
  }
  if (env.PAYMENT_PROVIDER !== "sandbox") {
    throw new Error(
      "No live payment provider is configured. Set PAYMENT_PROVIDER=sandbox for tests only.",
    );
  }

  const base = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const attemptId = `sandbox_${randomUUID()}`;
  return {
    provider: "sandbox",
    attemptId,
    status: "pending",
    mode: "sandbox",
    redirectUrl: `${base}/order/${encodeURIComponent(order.reference)}?token=${encodeURIComponent(order.lookupToken)}&payment=sandbox_pending`,
  };
}
