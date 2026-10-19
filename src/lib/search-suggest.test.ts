import { describe, expect, it } from "vitest";
import { getCategories } from "@/lib/catalogue";
import { suggestCategories, suggestProducts } from "./search-suggest";

describe("search suggestions", () => {
  const categories = getCategories();

  it("ignores very short queries", () => {
    expect(suggestProducts("j", categories)).toEqual([]);
  });

  it("ranks name prefix matches first and is accent/case insensitive", () => {
    const results = suggestProducts("JOHNNIE", categories);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.name.startsWith("Johnnie"))).toBe(true);
    expect(suggestProducts("adegamae", categories).length).toBeGreaterThan(0);
  });

  it("finds products by category name and caps the result count", () => {
    expect(suggestProducts("vodka", categories).length).toBeGreaterThan(0);
    expect(suggestProducts("a", categories, 2)).toEqual([]);
    expect(suggestProducts("label", categories, 2).length).toBeLessThanOrEqual(
      2,
    );
  });

  it("suggests matching categories", () => {
    expect(suggestCategories("spark", categories).map((c) => c.slug)).toEqual([
      "sparkling",
    ]);
    expect(suggestCategories("spirits", categories).length).toBe(3);
  });
});
