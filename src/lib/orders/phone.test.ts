import { describe, expect, it } from "vitest";
import { isValidCheckoutPhone, normalizePhone, phonesMatch } from "./phone";

describe("phonesMatch", () => {
  it("treats different spellings of one number as the same", () => {
    expect(phonesMatch("0788 123 456", "+250 788 123 456")).toBe(true);
    expect(phonesMatch("250788123456", "0788123456")).toBe(true);
  });

  it("rejects different or too-short numbers", () => {
    expect(phonesMatch("0788123456", "0788123457")).toBe(false);
    expect(phonesMatch("123", "123")).toBe(false);
    expect(phonesMatch("", "0788123456")).toBe(false);
  });
});

describe("phone validation", () => {
  it("accepts Rwanda mobile formats", () => {
    expect(isValidCheckoutPhone("+250788123456")).toBe(true);
    expect(isValidCheckoutPhone("0788123456")).toBe(true);
    expect(isValidCheckoutPhone("250 788 123 456")).toBe(true);
  });

  it("rejects short/invalid numbers", () => {
    expect(isValidCheckoutPhone("123")).toBe(false);
    expect(isValidCheckoutPhone("+250711123456")).toBe(false);
  });

  it("normalizes separators", () => {
    expect(normalizePhone("+250 788-123-456")).toBe("+250788123456");
  });
});
