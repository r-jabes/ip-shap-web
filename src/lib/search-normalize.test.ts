import { describe, expect, it } from "vitest";
import { matchesSearchQuery, normalizeSearchText } from "./search-normalize";

describe("normalizeSearchText", () => {
  it("strips accents and lowercases", () => {
    expect(normalizeSearchText("Café")).toBe("cafe");
    expect(normalizeSearchText("  ROZZITA ")).toBe("rozzita");
  });
});

describe("matchesSearchQuery", () => {
  it("matches regardless of accents", () => {
    expect(matchesSearchQuery("Pinta Negra", "pinta")).toBe(true);
    expect(matchesSearchQuery("Café Noir", "cafe")).toBe(true);
  });
});
