import { describe, expect, it } from "vitest";
import { isValidCheckoutPhone, normalizePhone } from "./phone";

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
