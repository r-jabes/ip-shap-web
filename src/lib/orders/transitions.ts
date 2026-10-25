export type FulfilmentStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "processing"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "delivered"
  | "ready_for_pickup"
  | "picked_up"
  | "cancelled";

export type PaymentStatus =
  | "not_applicable"
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

/** How the customer receives the order. */
export type FulfillmentMethod = "delivery" | "pickup";

/** Delivery journey, in order. Cancelled is a separate exit. */
export const DELIVERY_FULFILMENT_FLOW: readonly FulfilmentStatus[] = [
  "awaiting_confirmation",
  "confirmed",
  "processing",
  "ready_for_dispatch",
  "out_for_delivery",
  "delivered",
];

/**
 * Pickup journey, in order.
 * Payment is tracked separately (unpaid → paid) so staff can mark "awaiting payment"
 * without conflating money with fulfilment.
 */
export const PICKUP_FULFILMENT_FLOW: readonly FulfilmentStatus[] = [
  "awaiting_confirmation",
  "confirmed",
  "ready_for_pickup",
  "picked_up",
];

/** @deprecated Use DELIVERY_FULFILMENT_FLOW or fulfilmentFlowFor(method). */
export const FULFILMENT_FLOW = DELIVERY_FULFILMENT_FLOW;

const FINAL_STATUSES: ReadonlySet<FulfilmentStatus> = new Set([
  "delivered",
  "picked_up",
  "cancelled",
]);

export function fulfilmentFlowFor(
  method: FulfillmentMethod,
): readonly FulfilmentStatus[] {
  return method === "pickup" ? PICKUP_FULFILMENT_FLOW : DELIVERY_FULFILMENT_FLOW;
}

export function isTerminalFulfilment(status: FulfilmentStatus): boolean {
  return FINAL_STATUSES.has(status);
}

/**
 * Statuses an order can move to from `from` for the given fulfilment method.
 *
 * Staff may jump straight to any later step on that path and may cancel anything
 * that is not finished. Going backwards is not allowed.
 */
export function nextFulfilmentStatuses(
  from: FulfilmentStatus,
  method: FulfillmentMethod = "delivery",
): FulfilmentStatus[] {
  if (FINAL_STATUSES.has(from)) return [];
  const flow = fulfilmentFlowFor(method);
  const index = flow.indexOf(from);
  if (index < 0) {
    // Status does not belong on this path (data mismatch) — cancel is the safe exit.
    return ["cancelled"];
  }
  return [...flow.slice(index + 1), "cancelled"];
}

export function canTransitionFulfilment(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
  method: FulfillmentMethod = "delivery",
): boolean {
  if (from === to) return true;
  return nextFulfilmentStatuses(from, method).includes(to);
}

export function assertFulfilmentTransition(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
  method: FulfillmentMethod = "delivery",
): void {
  if (!canTransitionFulfilment(from, to, method)) {
    throw new Error(`Illegal fulfilment transition: ${from} → ${to}`);
  }
}
