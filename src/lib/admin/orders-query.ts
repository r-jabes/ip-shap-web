import type { StoredOrder } from "@/lib/orders/store";
import type {
  FulfilmentStatus,
  PaymentStatus,
} from "@/lib/orders/transitions";

export const ORDER_FULFILMENT_FILTERS: ReadonlyArray<{
  value: "" | FulfilmentStatus;
  label: string;
}> = [
  { value: "", label: "All fulfilment" },
  { value: "awaiting_confirmation", label: "Awaiting confirmation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "ready_for_dispatch", label: "Ready for dispatch" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "ready_for_pickup", label: "Ready for pickup" },
  { value: "picked_up", label: "Picked up" },
  { value: "cancelled", label: "Cancelled" },
];

export const ORDER_PAYMENT_FILTERS: ReadonlyArray<{
  value: "" | PaymentStatus;
  label: string;
}> = [
  { value: "", label: "All payments" },
  { value: "unpaid", label: "Unpaid" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "not_applicable", label: "Not applicable" },
];

export const ORDER_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total_desc", label: "Highest total" },
  { value: "total_asc", label: "Lowest total" },
] as const;

export type OrderSort = (typeof ORDER_SORT_OPTIONS)[number]["value"];

const FULFILMENT_SET = new Set(
  ORDER_FULFILMENT_FILTERS.map((option) => option.value).filter(Boolean),
);
const PAYMENT_SET = new Set(
  ORDER_PAYMENT_FILTERS.map((option) => option.value).filter(Boolean),
);
const SORT_SET = new Set(ORDER_SORT_OPTIONS.map((option) => option.value));

export function parseOrderSort(raw: string | undefined): OrderSort {
  if (raw && SORT_SET.has(raw as OrderSort)) return raw as OrderSort;
  return "newest";
}

export function parseFulfilmentFilter(
  raw: string | undefined,
): "" | FulfilmentStatus {
  if (raw && FULFILMENT_SET.has(raw as FulfilmentStatus)) {
    return raw as FulfilmentStatus;
  }
  return "";
}

export function parsePaymentFilter(
  raw: string | undefined,
): "" | PaymentStatus {
  if (raw && PAYMENT_SET.has(raw as PaymentStatus)) {
    return raw as PaymentStatus;
  }
  return "";
}

export function formatFulfilmentLabel(status: FulfilmentStatus): string {
  return (
    ORDER_FULFILMENT_FILTERS.find((option) => option.value === status)
      ?.label ?? status
  );
}

export function formatPaymentLabel(status: PaymentStatus): string {
  return (
    ORDER_PAYMENT_FILTERS.find((option) => option.value === status)?.label ??
    status
  );
}

export function filterAndSortOrders(
  orders: readonly StoredOrder[],
  input: {
    q?: string;
    fulfilment?: "" | FulfilmentStatus;
    payment?: "" | PaymentStatus;
    sort?: OrderSort;
  },
): StoredOrder[] {
  const q = (input.q ?? "").trim().toLowerCase();
  const fulfilment = input.fulfilment ?? "";
  const payment = input.payment ?? "";
  const sort = input.sort ?? "newest";

  let result = [...orders];

  if (q) {
    result = result.filter((order) => {
      const haystack = [
        order.reference,
        order.customerName,
        order.customerPhone,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (fulfilment) {
    result = result.filter((order) => order.fulfilmentStatus === fulfilment);
  }

  if (payment) {
    result = result.filter((order) => order.paymentStatus === payment);
  }

  result.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "total_desc":
        return b.total.amount - a.total.amount;
      case "total_asc":
        return a.total.amount - b.total.amount;
      case "newest":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return result;
}

export function formatOrderPlacedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
