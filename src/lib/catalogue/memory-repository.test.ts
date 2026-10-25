import { describe, expect, it } from "vitest";
import { createMemoryCatalogueRepository } from "./memory-repository";

describe("createMemoryCatalogueRepository", () => {
  it("serves fixtures when enabled", async () => {
    const repo = createMemoryCatalogueRepository({ enabled: true });
    const products = await repo.listProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(await repo.listCategories()).not.toHaveLength(0);
  });

  it("fail-closes when disabled", async () => {
    const repo = createMemoryCatalogueRepository({ enabled: false });
    expect(await repo.listProducts()).toEqual([]);
    expect(await repo.listCategories()).toEqual([]);
    expect(await repo.getProductBySlug("any")).toBeUndefined();
    expect(await repo.getFeaturedProducts()).toEqual([]);
  });
});
