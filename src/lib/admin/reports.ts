import type { StoredOrder } from "@/lib/orders/store";

/** Kigali is UTC+2 all year (no daylight saving), so a fixed offset gives the right local day. */
const KIGALI_OFFSET_MS = 2 * 60 * 60 * 1000;

export type DaySales = {
  /** Local calendar day, `YYYY-MM-DD`. */
  day: string;
  orders: number;
  /** Value of orders placed that day, excluding cancelled ones. */
  sales: number;
};

export type BestSeller = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type SalesReport = {
  days: DaySales[];
  totals: {
    orders: number;
    cancelled: number;
    sales: number;
    received: number;
    averageOrder: number;
  };
  bestSellers: BestSeller[];
};

export function kigaliDay(iso: string | Date): string {
  const time = typeof iso === "string" ? new Date(iso).getTime() : iso.getTime();
  return new Date(time + KIGALI_OFFSET_MS).toISOString().slice(0, 10);
}

/** The last `count` local days ending at `now`, oldest first. */
export function lastDays(now: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    kigaliDay(new Date(now.getTime() - (count - 1 - index) * 24 * 60 * 60 * 1000)),
  );
}

/**
 * Sales summary for the last `dayCount` days. Cancelled orders are counted separately and never
 * add to sales or best-sellers. Days with no orders are included as zeros so charts have no gaps.
 */
export function buildSalesReport(
  orders: StoredOrder[],
  now: Date,
  dayCount: number,
  bestSellerLimit = 10,
): SalesReport {
  const days = lastDays(now, dayCount);
  const inRange = new Set(days);
  const byDay = new Map<string, DaySales>(
    days.map((day) => [day, { day, orders: 0, sales: 0 }]),
  );
  const products = new Map<string, BestSeller>();
  const totals = { orders: 0, cancelled: 0, sales: 0, received: 0 };

  for (const order of orders) {
    const day = kigaliDay(order.createdAt);
    if (!inRange.has(day)) continue;

    if (order.fulfilmentStatus === "cancelled") {
      totals.cancelled += 1;
      continue;
    }

    const row = byDay.get(day)!;
    row.orders += 1;
    row.sales += order.total.amount;
    totals.orders += 1;
    totals.sales += order.total.amount;
    totals.received += order.amountPaid?.amount ?? 0;

    for (const item of order.items) {
      const entry = products.get(item.productId) ?? {
        productId: item.productId,
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.lineTotal.amount;
      products.set(item.productId, entry);
    }
  }

  return {
    days: days.map((day) => byDay.get(day)!),
    totals: {
      ...totals,
      averageOrder:
        totals.orders === 0 ? 0 : Math.round(totals.sales / totals.orders),
    },
    bestSellers: [...products.values()]
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, bestSellerLimit),
  };
}
