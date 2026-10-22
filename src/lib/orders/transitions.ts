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

const FULFILMENT_TRANSITIONS: Record<FulfilmentStatus, FulfilmentStatus[]> = {
  awaiting_confirmation: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_for_dispatch", "cancelled"],
  ready_for_dispatch: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** Statuses an order can move to from `from` (empty when it is finished). */
export function nextFulfilmentStatuses(
  from: FulfilmentStatus,
): FulfilmentStatus[] {
  return [...FULFILMENT_TRANSITIONS[from]];
}

export function canTransitionFulfilment(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
): boolean {
  if (from === to) return true;
  return FULFILMENT_TRANSITIONS[from].includes(to);
}

export function assertFulfilmentTransition(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
): void {
  if (!canTransitionFulfilment(from, to)) {
    throw new Error(`Illegal fulfilment transition: ${from} → ${to}`);
  }
}
