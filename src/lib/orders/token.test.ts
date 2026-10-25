import { describe, expect, it } from "vitest";
import { secureTokenEquals } from "./token";

describe("secureTokenEquals", () => {
  it("matches equal tokens", () => {
    expect(secureTokenEquals("abc123", "abc123")).toBe(true);
  });

  it("rejects different tokens of same length", () => {
    expect(secureTokenEquals("abc123", "abc124")).toBe(false);
  });

  it("rejects different lengths without throwing", () => {
    expect(secureTokenEquals("short", "much-longer-token")).toBe(false);
  });
});
