export type FulfilmentStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "processing"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "not_applicable"
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

/** The normal journey of an order, in order. "cancelled" is a separate exit. */
export const FULFILMENT_FLOW: readonly FulfilmentStatus[] = [
  "awaiting_confirmation",
  "confirmed",
  "processing",
  "ready_for_dispatch",
  "out_for_delivery",
  "delivered",
];

const FINAL_STATUSES: ReadonlySet<FulfilmentStatus> = new Set([
  "delivered",
  "cancelled",
]);

/**
 * Statuses an order can move to from `from`.
 *
 * Staff may jump straight to any later step (a walk-in order can go from "awaiting confirmation"
 * to "delivered" in one move) and may cancel anything that is not finished. Going backwards is not
 * allowed: it would hide what already happened, so corrections are made by cancelling instead.
 */
export function nextFulfilmentStatuses(
  from: FulfilmentStatus,
): FulfilmentStatus[] {
  if (FINAL_STATUSES.has(from)) return [];
  const later = FULFILMENT_FLOW.slice(FULFILMENT_FLOW.indexOf(from) + 1);
  return [...later, "cancelled"];
}

export function canTransitionFulfilment(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
): boolean {
  if (from === to) return true;
  return nextFulfilmentStatuses(from).includes(to);
}

export function assertFulfilmentTransition(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
): void {
  if (!canTransitionFulfilment(from, to)) {
    throw new Error(`Illegal fulfilment transition: ${from} → ${to}`);
  }
}
