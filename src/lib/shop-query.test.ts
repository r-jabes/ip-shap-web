import { describe, expect, it } from "vitest";
import {
  buildShopHref,
  parseShopSearchParams,
  shopQueryToFilters,
  toggleInList,
} from "@/lib/shop-query";

describe("shop-query", () => {
  it("parses multi-select category and brand from repeated params", () => {
    const query = parseShopSearchParams({
      category: ["wine", "gin"],
      brand: "johnnie-walker",
      availability: "unknown",
      sort: "price_asc",
      minPrice: "12000",
      maxPrice: "40000",
      page: "2",
      q: " red ",
    });

    expect(query.categories).toEqual(["wine", "gin"]);
    expect(query.brands).toEqual(["johnnie-walker"]);
    expect(query.availability).toBe("unknown");
    expect(query.sort).toBe("price_asc");
    expect(query.minPrice).toBe(12000);
    expect(query.maxPrice).toBe(40000);
    expect(query.page).toBe(2);
    expect(query.q).toBe("red");
  });

  it("keeps legacy single category strings working", () => {
    const query = parseShopSearchParams({ category: "whisky" });
    expect(query.categories).toEqual(["whisky"]);
    expect(buildShopHref(query)).toBe("/shop?category=whisky");
  });

  it("round-trips filters into the URL without defaults", () => {
    const href = buildShopHref({
      categories: ["wine"],
      brands: ["boxed"],
      availability: "in_stock",
      sort: "price_desc",
      q: "sparkling",
      minPrice: 13000,
      page: 3,
    });
    expect(href).toContain("category=wine");
    expect(href).toContain("brand=boxed");
    expect(href).toContain("availability=in_stock");
    expect(href).toContain("sort=price_desc");
    expect(href).toContain("q=sparkling");
    expect(href).toContain("minPrice=13000");
    expect(href).toContain("page=3");
    expect(href).not.toContain("name_asc");
  });

  it("maps to catalogue filters and toggles lists", () => {
    const query = parseShopSearchParams({
      category: ["wine", "gin"],
      brand: ["smirnoff"],
    });
    expect(shopQueryToFilters(query)).toEqual({
      categorySlugs: ["wine", "gin"],
      brandSlugs: ["smirnoff"],
      availability: "all",
      sort: "name_asc",
      q: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
    expect(toggleInList(["wine"], "gin")).toEqual(["wine", "gin"]);
    expect(toggleInList(["wine", "gin"], "wine")).toEqual(["gin"]);
  });

  it("clears price bounds when omitted from the href builder", () => {
    const base = parseShopSearchParams({
      minPrice: "12000",
      maxPrice: "20000",
      category: "vodka",
    });
    expect(
      buildShopHref({ minPrice: undefined, maxPrice: undefined }, base),
    ).toBe("/shop?category=vodka");
  });
});
