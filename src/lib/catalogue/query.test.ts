import { describe, expect, it } from "vitest";
import {
  applyFilters,
  computeFacets,
  lowestPrice,
  paginate,
  relatedCandidateIds,
  siblingIds,
} from "@/lib/catalogue/query";
import type { CatalogueIndexEntry } from "@/lib/catalogue/repository";
import { moneyRwf } from "@/lib/money";

function entry(
  id: string,
  overrides: Partial<CatalogueIndexEntry> = {},
): CatalogueIndexEntry {
  return {
    id,
    slug: id,
    name: `Drink ${id}`,
    brandSlug: "brand-a",
    brandName: "Brand A",
    categorySlug: "wine",
    availability: "in_stock",
    status: "published",
    price: moneyRwf(10_000),
    ...overrides,
  };
}

const index: CatalogueIndexEntry[] = [
  entry("a", { name: "Alpha", price: moneyRwf(5_000) }),
  entry("b", {
    name: "Bravo",
    brandSlug: "brand-b",
    brandName: "Brand B",
    categorySlug: "whisky",
    price: moneyRwf(20_000),
  }),
  entry("c", {
    name: "Charlie",
    availability: "unknown",
    price: moneyRwf(15_000),
  }),
  entry("hidden", { name: "Hidden", status: "draft" }),
];

describe("applyFilters", () => {
  it("never returns unpublished products", () => {
    const ids = applyFilters(index, {}).map((row) => row.id);
    expect(ids).not.toContain("hidden");
  });

  it("filters by category and sorts by price", () => {
    const rows = applyFilters(index, {
      categorySlug: "wine",
      sort: "price_desc",
    });
    expect(rows.map((row) => row.id)).toEqual(["c", "a"]);
  });

  it("trusts the database's search result instead of matching text again", () => {
    const rows = applyFilters(index, { q: "no such words" }, new Set(["b"]));
    expect(rows.map((row) => row.id)).toEqual(["b"]);
  });

  it("still respects other filters when the database matched the text", () => {
    const rows = applyFilters(
      index,
      { q: "x", categorySlug: "wine" },
      new Set(["a", "b"]),
    );
    expect(rows.map((row) => row.id)).toEqual(["a"]);
  });
});

describe("computeFacets", () => {
  const categories = [
    { slug: "wine", name: "Wine" },
    { slug: "whisky", name: "Whisky" },
  ] as Parameters<typeof computeFacets>[1];
  const brands = [
    { slug: "brand-a", name: "Brand A" },
    { slug: "brand-b", name: "Brand B" },
  ] as Parameters<typeof computeFacets>[2];

  it("counts each option without applying its own filter", () => {
    const facets = computeFacets(index, categories, brands, {
      categorySlug: "wine",
    });
    // Whisky still shows its count so the shopper can switch range.
    expect(facets.categories.find((row) => row.slug === "whisky")?.count).toBe(
      1,
    );
    expect(facets.categories.find((row) => row.slug === "wine")?.count).toBe(2);
  });

  it("reports the price range of the whole published catalogue", () => {
    const facets = computeFacets(index, categories, brands, {});
    expect(facets.priceBounds.max).toBe(20_000);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i);

  it("slices a page and counts pages", () => {
    const result = paginate(items, 2, 12);
    expect(result.items).toHaveLength(12);
    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(25);
  });

  it("clamps out-of-range pages", () => {
    expect(paginate(items, 99, 12).page).toBe(3);
    expect(paginate(items, -4, 12).page).toBe(1);
    expect(paginate([], 1, 12).totalPages).toBe(1);
  });
});

describe("siblings, related and lowest price", () => {
  it("lists other drinks from the same brand only", () => {
    expect(siblingIds(index, { id: "a", brandSlug: "brand-a" })).toEqual([
      "c",
    ]);
    expect(siblingIds(index, { id: "a", brandSlug: "" })).toEqual([]);
  });

  it("puts the same range first when suggesting related drinks", () => {
    const ids = relatedCandidateIds(index, { id: "a", categorySlug: "wine" }, 2);
    expect(ids[0]).toBe("c");
    expect(ids).not.toContain("a");
  });

  it("finds the lowest price in a range", () => {
    expect(lowestPrice(index, "wine")).toBe(5_000);
    expect(lowestPrice(index, "nothing")).toBeNull();
  });
});
