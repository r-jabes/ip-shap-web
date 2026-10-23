import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DemoProduct } from "@/domain/catalogue";

const getFeaturedProductsDurable = vi.fn();

vi.mock("@/lib/catalogue", () => ({
  getFeaturedProductsDurable: (...args: unknown[]) =>
    getFeaturedProductsDurable(...args),
}));

import { getHomeFeaturedSlidesDurable } from "@/lib/home-featured";

function product(overrides: Partial<DemoProduct> = {}): DemoProduct {
  return {
    id: "p1",
    slug: "house-red",
    name: "House Red",
    description: "A red wine.",
    price: { amount: 12000, currency: "RWF" },
    brandSlug: "",
    brandName: "",
    status: "published",
    availability: "in_stock",
    isProvisional: false,
    images: [],
    ...overrides,
  } as DemoProduct;
}

describe("home featured slides", () => {
  beforeEach(() => {
    getFeaturedProductsDurable.mockReset();
  });

  it("is empty when the admin has not featured anything", async () => {
    getFeaturedProductsDurable.mockResolvedValue([]);
    await expect(getHomeFeaturedSlidesDurable()).resolves.toEqual([]);
  });

  it("builds one slide per featured product, with or without a brand", async () => {
    getFeaturedProductsDurable.mockResolvedValue([
      product(),
      product({ id: "p2", slug: "gin", name: "Gin", brandName: "Rozzita" }),
    ]);
    const slides = await getHomeFeaturedSlidesDurable();
    expect(slides.map((slide) => slide.id)).toEqual(["p1", "p2"]);
    expect(slides[0]!.href).toBe("/product/house-red");
    expect(slides[0]!.points[0]).toBe("From our shelf");
    expect(slides[1]!.points[0]).toBe("From Rozzita");
  });
});
