import { afterEach, describe, expect, it, vi } from "vitest";

describe("listProducts", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("returns demo products when demo mode is enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { listProducts } = await import("./catalogue");
    expect(listProducts().length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { listProducts } = await import("./catalogue");
    const wines = listProducts({ categorySlug: "wine" });
    expect(wines.every((product) => product.categorySlug === "wine")).toBe(
      true,
    );
  });

  it("sorts by price ascending", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { listProducts } = await import("./catalogue");
    const sorted = listProducts({ sort: "price_asc" });
    const amounts = sorted.map((product) => product.price.amount);
    expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
  });

  it("supports multi-select category and brand filters", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { listProducts } = await import("./catalogue");
    const mixed = listProducts({ categorySlugs: ["wine", "gin"] });
    expect(mixed.length).toBeGreaterThan(0);
    expect(
      mixed.every(
        (product) =>
          product.categorySlug === "wine" || product.categorySlug === "gin",
      ),
    ).toBe(true);
  });

  it("returns facet counts that ignore the dimension being counted", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { getFilterFacets, listProducts } = await import("./catalogue");
    const facets = getFilterFacets({ categorySlugs: ["wine"] });
    const wineFacet = facets.categories.find((row) => row.slug === "wine");
    expect(wineFacet?.count).toBe(
      listProducts({ categorySlugs: ["wine"] }).length,
    );
    expect(wineFacet?.count).toBeGreaterThan(0);
    expect(facets.priceBounds.min).toBeLessThanOrEqual(facets.priceBounds.max);
    // Selecting wine should not invent in-stock counts when the catalogue is ask-us.
    const inStock = facets.availability.find((row) => row.value === "in_stock");
    expect(inStock?.count).toBe(0);
  });

  it("returns brand siblings and related products without shared photos", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { getBrandSiblings, getProductBySlug, getRelatedProducts } =
      await import("./catalogue");
    const chocolate = getProductBySlug("product-001-rozzita-chocolate");
    expect(chocolate).toBeTruthy();
    const siblings = getBrandSiblings(chocolate!);
    expect(siblings.length).toBeGreaterThan(0);
    expect(siblings.every((row) => row.brandSlug === "rozzita")).toBe(true);
    expect(siblings.some((row) => row.id === chocolate!.id)).toBe(false);

    const whisky = getProductBySlug("product-012-johnnie-walker-black-label");
    // Black / Double / Red share one photo — related must skip those duplicates
    // (and may fill from other ranges when the same shelf has nothing left).
    if (whisky) {
      const related = getRelatedProducts(whisky, 8);
      const ownSrc = whisky.images[0]?.src;
      expect(related.length).toBeGreaterThan(0);
      expect(related.every((row) => row.images[0]?.src !== ownSrc)).toBe(true);
      expect(related.some((row) => row.id === whisky.id)).toBe(false);
    }
  });

  it("paginates small and large result sets", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { paginateProducts, CATALOGUE_PAGE_SIZE } =
      await import("./catalogue");

    const six = Array.from({ length: 6 }, (_, index) => ({ id: `s-${index}` }));
    const sixPage = paginateProducts(six, 1);
    expect(sixPage.total).toBe(6);
    expect(sixPage.totalPages).toBe(1);
    expect(sixPage.items).toHaveLength(6);

    const sixty = Array.from({ length: 60 }, (_, index) => ({
      id: `n-${index}`,
    }));
    const first = paginateProducts(sixty, 1);
    const last = paginateProducts(sixty, 5);
    expect(first.items).toHaveLength(CATALOGUE_PAGE_SIZE);
    expect(first.totalPages).toBe(5);
    expect(last.page).toBe(5);
    expect(last.items).toHaveLength(CATALOGUE_PAGE_SIZE);
    expect(paginateProducts(sixty, 99).page).toBe(5);
  });

  it("fail-closes sync catalogue when demo mode is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    const {
      listProducts,
      getCategories,
      getBrands,
      getProductBySlug,
      getFeaturedProducts,
    } = await import("./catalogue");
    expect(listProducts()).toEqual([]);
    expect(getCategories()).toEqual([]);
    expect(getBrands()).toEqual([]);
    expect(getProductBySlug("product-001-rozzita-chocolate")).toBeUndefined();
    expect(getFeaturedProducts()).toEqual([]);
  });
});
