import type { FulfilmentStatus } from "@/lib/orders/transitions";

/** How an order's progress is worded for shoppers (staff see the admin wording). */
const LABELS: Record<FulfilmentStatus, string> = {
  awaiting_confirmation: "Waiting for our confirmation",
  confirmed: "Confirmed",
  processing: "Being prepared",
  ready_for_dispatch: "Ready to go",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  ready_for_pickup: "Ready for pickup",
  picked_up: "Picked up",
  cancelled: "Cancelled",
};

export function customerStatusLabel(status: FulfilmentStatus): string {
  return LABELS[status] ?? "In progress";
}
