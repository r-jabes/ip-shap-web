import { describe, expect, it } from "vitest";
import {
  addMoney,
  formatRwf,
  moneyRwf,
  multiplyMoney,
  subtractMoney,
} from "./money";

describe("moneyRwf", () => {
  it("accepts integer amounts", () => {
    expect(moneyRwf(28000)).toEqual({ amount: 28000, currency: "RWF" });
  });

  it("rejects non-integers", () => {
    expect(() => moneyRwf(12.5)).toThrow(/integers/);
  });

  it("rejects negative amounts", () => {
    expect(() => moneyRwf(-1)).toThrow(/non-negative/);
  });
});

describe("formatRwf", () => {
  it("formats without fractional digits", () => {
    const formatted = formatRwf(28000);
    expect(formatted.replace(/\u00a0/g, " ")).toContain("28");
    expect(formatted).toMatch(/RWF|FRw|RF/i);
  });
});

describe("addMoney", () => {
  it("adds integer amounts", () => {
    expect(addMoney(moneyRwf(12000), moneyRwf(13000))).toEqual(moneyRwf(25000));
  });
});

describe("money invariants", () => {
  it("line totals equal unit × qty for random safe integers", () => {
    for (let i = 0; i < 50; i += 1) {
      const unit = Math.floor(Math.random() * 50_000);
      const qty = Math.floor(Math.random() * 20) + 1;
      const line = multiplyMoney(moneyRwf(unit), qty);
      expect(line.amount).toBe(unit * qty);
      expect(Number.isInteger(line.amount)).toBe(true);
    }
  });

  it("rejects overflow and negative subtraction", () => {
    expect(() => multiplyMoney(moneyRwf(Number.MAX_SAFE_INTEGER), 2)).toThrow(
      /overflow/i,
    );
    expect(() => subtractMoney(moneyRwf(10), moneyRwf(11))).toThrow(
      /negative/i,
    );
  });
});
