import { describe, expect, it } from "vitest";
import {
  applyDiscount,
  impliedDiscountPercent,
  parseDiscountPercent,
} from "./discount";

describe("applyDiscount", () => {
  it("returns the regular price when there is no discount", () => {
    expect(applyDiscount(20000, 0)).toEqual({ price: 20000, compareAt: null });
  });

  it("keeps the regular price as compareAt and rounds the sale price", () => {
    expect(applyDiscount(20000, 15)).toEqual({ price: 17000, compareAt: 20000 });
    expect(applyDiscount(12345, 10)).toEqual({ price: 11111, compareAt: 12345 });
  });

  it("ignores discounts that would not lower the price", () => {
    expect(applyDiscount(1, 10)).toEqual({ price: 1, compareAt: null });
  });
});

describe("impliedDiscountPercent", () => {
  it("round-trips with applyDiscount", () => {
    const { price, compareAt } = applyDiscount(20000, 15);
    expect(impliedDiscountPercent(price, compareAt)).toBe(15);
    expect(impliedDiscountPercent(20000, null)).toBe(0);
  });
});

describe("parseDiscountPercent", () => {
  it("accepts blank as none and rejects out-of-range values", () => {
    expect(parseDiscountPercent("")).toBe(0);
    expect(parseDiscountPercent("25")).toBe(25);
    expect(() => parseDiscountPercent("95")).toThrow();
    expect(() => parseDiscountPercent("-1")).toThrow();
    expect(() => parseDiscountPercent("abc")).toThrow();
  });
});
