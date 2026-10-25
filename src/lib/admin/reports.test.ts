import { describe, expect, it } from "vitest";
import { buildSalesReport, kigaliDay, lastDays } from "@/lib/admin/reports";
import { moneyRwf } from "@/lib/money";
import type { StoredOrder } from "@/lib/orders/store";

function order(
  id: string,
  createdAt: string,
  total: number,
  items: Array<[string, string, number, number]>,
  overrides: Partial<StoredOrder> = {},
): StoredOrder {
  return {
    id,
    createdAt,
    fulfilmentStatus: "confirmed",
    total: moneyRwf(total),
    amountPaid: null,
    items: items.map(([productId, productName, quantity, line]) => ({
      productId,
      productName,
      quantity,
      lineTotal: moneyRwf(line),
    })),
    ...overrides,
  } as unknown as StoredOrder;
}

const now = new Date("2026-10-23T10:00:00Z");

describe("kigaliDay", () => {
  it("uses the Kigali calendar day, not UTC", () => {
    // 23:30 UTC on the 22nd is already 01:30 on the 23rd in Kigali.
    expect(kigaliDay("2026-10-22T23:30:00Z")).toBe("2026-10-23");
    expect(kigaliDay("2026-10-22T21:59:00Z")).toBe("2026-10-22");
  });

  it("lists consecutive days oldest first", () => {
    expect(lastDays(now, 3)).toEqual(["2026-10-21", "2026-10-22", "2026-10-23"]);
  });
});

describe("buildSalesReport", () => {
  const orders = [
    order("a", "2026-10-23T08:00:00Z", 30_000, [["p1", "Wine", 1, 20_000], ["p2", "Gin", 1, 10_000]], {
      amountPaid: moneyRwf(30_000),
    }),
    order("b", "2026-10-22T08:00:00Z", 10_000, [["p2", "Gin", 1, 10_000]]),
    order("c", "2026-10-22T09:00:00Z", 50_000, [["p1", "Wine", 5, 50_000]], {
      fulfilmentStatus: "cancelled",
    }),
    order("old", "2026-01-01T09:00:00Z", 99_999, [["p3", "Old", 1, 99_999]]),
  ];

  it("adds up sales and money received", () => {
    const report = buildSalesReport(orders, now, 7);
    expect(report.totals).toMatchObject({
      orders: 2,
      sales: 40_000,
      received: 30_000,
      averageOrder: 20_000,
      cancelled: 1,
    });
  });

  it("ignores cancelled orders and orders outside the period", () => {
    const report = buildSalesReport(orders, now, 7);
    expect(report.bestSellers.map((row) => row.name)).toEqual(["Gin", "Wine"]);
    expect(report.bestSellers.some((row) => row.productId === "p3")).toBe(false);
  });

  it("fills quiet days with zeros so a chart has no gaps", () => {
    const report = buildSalesReport(orders, now, 3);
    expect(report.days).toEqual([
      { day: "2026-10-21", orders: 0, sales: 0 },
      { day: "2026-10-22", orders: 1, sales: 10_000 },
      { day: "2026-10-23", orders: 1, sales: 30_000 },
    ]);
  });

  it("ranks best sellers by units sold, then revenue", () => {
    const report = buildSalesReport(orders, now, 7);
    expect(report.bestSellers[0]).toMatchObject({ name: "Gin", quantity: 2 });
  });

  it("copes with no orders", () => {
    const report = buildSalesReport([], now, 7);
    expect(report.totals.averageOrder).toBe(0);
    expect(report.bestSellers).toEqual([]);
  });
});
