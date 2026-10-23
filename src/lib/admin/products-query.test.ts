import { describe, expect, it } from "vitest";
import type { DemoProduct } from "@/domain/catalogue";
import {
  filterProducts,
  parseProductSort,
  sortProducts,
} from "@/lib/admin/products-query";
import { moneyRwf } from "@/lib/money";

function product(overrides: Partial<DemoProduct>): DemoProduct {
  return {
    id: overrides.name ?? "p",
    slug: "s",
    name: "Item",
    description: "",
    price: moneyRwf(1000),
    categorySlug: "wine",
    images: [{}] as never[],
    status: "published",
    availability: "in_stock",
    stockQuantity: 10,
    brandSlug: "",
    brandName: "",
    isProvisional: false,
    demoLabel: "",
    ...overrides,
  } as DemoProduct;
}

const items = [
  product({ name: "Alpha", price: moneyRwf(3000), stockQuantity: 5 }),
  product({ name: "Bravo", price: moneyRwf(1000), stockQuantity: null, availability: "unknown" }),
  product({ name: "Charlie", price: moneyRwf(2000), stockQuantity: 0, availability: "out_of_stock" }),
  product({ name: "Delta", status: "archived" }),
  product({ name: "Echo", status: "draft", images: [] }),
  product({ name: "Foxtrot", barcode: "6001234567890", stockQuantity: 2, availability: "low_stock" }),
];

describe("filterProducts", () => {
  it("hides archived products by default", () => {
    expect(filterProducts(items, {}).map((p) => p.name)).not.toContain("Delta");
  });

  it("finds sold out products and products that are not ready to publish", () => {
    expect(filterProducts(items, { status: "soldout" }).map((p) => p.name)).toEqual(["Charlie"]);
    expect(filterProducts(items, { status: "incomplete" }).map((p) => p.name)).toEqual(["Echo"]);
  });

  it("finds products by barcode", () => {
    expect(filterProducts(items, { q: "600123" }).map((p) => p.name)).toEqual(["Foxtrot"]);
  });
});

describe("sortProducts", () => {
  it("sorts by price in either direction", () => {
    expect(sortProducts(items.slice(0, 3), "price", "asc").map((p) => p.name)).toEqual([
      "Bravo",
      "Charlie",
      "Alpha",
    ]);
    expect(sortProducts(items.slice(0, 3), "price", "desc")[0].name).toBe("Alpha");
  });

  it("puts untracked stock last when sorting by stock ascending", () => {
    expect(sortProducts(items.slice(0, 3), "stock", "asc").map((p) => p.name)).toEqual([
      "Charlie",
      "Alpha",
      "Bravo",
    ]);
  });

  it("falls back to name for unknown sort values", () => {
    expect(parseProductSort("nonsense", "up")).toEqual({ key: "name", dir: "asc" });
  });
});
