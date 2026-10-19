import { describe, expect, it } from "vitest";
import { moneyRwf } from "@/lib/money";
import {
  sampleCompareAtPrice,
  sampleDiscountPercent,
} from "@/lib/sample-pricing";

describe("sample-pricing", () => {
  it("omits sample sale under the threshold", () => {
    expect(sampleCompareAtPrice(moneyRwf(12_000))).toBeUndefined();
  });

  it("builds a higher compare-at price and a positive percent", () => {
    const price = moneyRwf(60_000);
    const compareAt = sampleCompareAtPrice(price);
    expect(compareAt?.amount).toBeGreaterThan(price.amount);
    expect(sampleDiscountPercent(price, compareAt!)).toBeGreaterThan(0);
  });
});
