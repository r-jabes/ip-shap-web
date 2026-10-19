import { describe, expect, it } from "vitest";
import { addMoney, formatRwf, moneyRwf } from "./money";

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
