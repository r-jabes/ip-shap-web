import { describe, expect, it } from "vitest";
import type { DemoProduct } from "@/domain/catalogue";
import { buildAttention } from "@/lib/admin/attention";
import { moneyRwf } from "@/lib/money";

const now = new Date("2026-10-23T10:00:00Z");
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

function product(overrides: Partial<DemoProduct>): DemoProduct {
  return {
    id: "p",
    name: "Item",
    price: moneyRwf(1000),
    categorySlug: "wine",
    images: [{}] as never[],
    status: "published",
    availability: "in_stock",
    stockQuantity: 20,
    ...overrides,
  } as DemoProduct;
}

describe("buildAttention", () => {
  it("is empty when nothing needs doing", () => {
    expect(buildAttention([product({})], [], now)).toEqual([]);
  });

  it("separates orders about to expire from fresh ones", () => {
    const orders = [
      { fulfilmentStatus: "awaiting_confirmation", paymentStatus: "unpaid", createdAt: daysAgo(2.5) },
      { fulfilmentStatus: "awaiting_confirmation", paymentStatus: "unpaid", createdAt: daysAgo(0.1) },
      { fulfilmentStatus: "confirmed", paymentStatus: "unpaid", createdAt: daysAgo(5) },
    ];
    const items = buildAttention([], orders, now);
    expect(items.map((item) => [item.key, item.count])).toEqual([
      ["orders-expiring", 1],
      ["orders-new", 1],
    ]);
    expect(items[0].label).toMatch(/1 order has waited/);
  });

  it("flags sold out, low and unfinished published products", () => {
    const items = buildAttention(
      [
        product({ id: "a", availability: "out_of_stock", stockQuantity: 0 }),
        product({ id: "b", availability: "low_stock", stockQuantity: 2 }),
        product({ id: "c", images: [] }),
        product({ id: "d", status: "archived", availability: "out_of_stock" }),
      ],
      [],
      now,
    );
    expect(items.map((item) => item.key)).toEqual([
      "sold-out",
      "low-stock",
      "incomplete",
    ]);
  });
});
