import { describe, expect, it } from "vitest";
import type { DemoProduct } from "@/domain/catalogue";
import { moneyRwf } from "@/lib/money";
import { computeProductCounts } from "./product-counts";

function product(
  status: DemoProduct["status"],
  availability: DemoProduct["availability"] = "in_stock",
): DemoProduct {
  return {
    id: crypto.randomUUID(),
    slug: crypto.randomUUID(),
    name: "x",
    description: "",
    price: moneyRwf(1000),
    brandSlug: "b",
    brandName: "B",
    status,
    availability,
    isProvisional: false,
    demoLabel: "",
    images: [],
  };
}

describe("computeProductCounts", () => {
  it("keeps archived products out of the total", () => {
    const counts = computeProductCounts([
      product("published"),
      product("draft", "unknown"),
      product("archived", "out_of_stock"),
    ]);
    expect(counts).toMatchObject({
      totalProducts: 2,
      published: 1,
      draft: 1,
      archived: 1,
      unknownStock: 1,
      outOfStock: 0,
    });
  });
});
