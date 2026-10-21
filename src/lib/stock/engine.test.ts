import { describe, expect, it } from "vitest";
import {
  availabilityAfterDecrement,
  availabilityAfterRestore,
  isCountedStock,
  isLowStockItem,
  LOW_STOCK_THRESHOLD,
} from "./engine";

describe("isCountedStock", () => {
  it("rejects unknown even with a quantity", () => {
    expect(
      isCountedStock({ availability: "unknown", quantity: 3 }),
    ).toBe(false);
  });

  it("accepts known availability with non-negative qty", () => {
    expect(isCountedStock({ availability: "in_stock", quantity: 0 })).toBe(
      true,
    );
  });
});

describe("availability helpers", () => {
  it("marks out of stock at zero after decrement", () => {
    expect(availabilityAfterDecrement("in_stock", 0)).toBe("out_of_stock");
  });

  it("marks low stock near threshold", () => {
    expect(availabilityAfterDecrement("in_stock", LOW_STOCK_THRESHOLD)).toBe(
      "low_stock",
    );
  });

  it("restores toward in_stock when quantity recovers", () => {
    expect(availabilityAfterRestore("out_of_stock", 10)).toBe("in_stock");
  });
});

describe("isLowStockItem", () => {
  it("flags low_stock availability and small counts", () => {
    expect(
      isLowStockItem({ availability: "low_stock", quantity: 20 }),
    ).toBe(true);
    expect(
      isLowStockItem({ availability: "in_stock", quantity: 2 }),
    ).toBe(true);
    expect(
      isLowStockItem({ availability: "unknown", quantity: null }),
    ).toBe(false);
  });
});
