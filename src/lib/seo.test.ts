import { afterEach, describe, expect, it, vi } from "vitest";
import type { CatalogueProduct } from "@/domain/catalogue";
import { moneyRwf } from "@/lib/money";

const product: CatalogueProduct = {
  id: "22222222-2222-4222-8222-222222222099",
  slug: "sample",
  name: "Sample Drink",
  description: "A sample description for SEO tests.",
  price: moneyRwf(15000),
  status: "published",
  availability: "unknown",
  isProvisional: false,
  brandSlug: "sample",
  brandName: "Sample Brand",
  demoLabel: "Test",
  images: [
    {
      id: "i1",
      role: "catalogue_primary",
      src: "/products/drink-17000.jpeg",
      alt: "Green bottle",
      width: 810,
      height: 1080,
      sortOrder: 0,
      processingStatus: "approved_for_catalogue",
    },
  ],
};

describe("organizationJsonLd", () => {
  it("includes legal name and optional contact", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    const { resetEnvCacheForTests } = await import("./env");
    resetEnvCacheForTests();
    const { organizationJsonLd } = await import("./seo");
    const json = organizationJsonLd({
      telephone: "250788937270",
      email: "patrickiradukunda505@gmail.com",
    });
    expect(json["@type"]).toBe("LiquorStore");
    expect(json.legalName).toBe("THE IP SHAP BUSINESS LTD");
    expect(json.telephone).toBe("+250788937270");
    expect(json.email).toBe("patrickiradukunda505@gmail.com");
  });
});

describe("productJsonLd", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("emits RWF price and does not invent reviews", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { productJsonLd } = await import("./seo");
    const json = productJsonLd(product);
    expect(json.offers.priceCurrency).toBe("RWF");
    expect(json.offers.price).toBe(15000);
    expect(json.offers.availability).toBe(
      "https://schema.org/LimitedAvailability",
    );
    expect(json).not.toHaveProperty("aggregateRating");
    expect(json).not.toHaveProperty("review");
  });

  it("maps out_of_stock correctly", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { productJsonLd } = await import("./seo");
    const json = productJsonLd({
      ...product,
      availability: "out_of_stock",
    });
    expect(json.offers.availability).toBe("https://schema.org/OutOfStock");
  });
});
