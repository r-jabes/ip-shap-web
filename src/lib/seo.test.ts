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

async function loadSeo() {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
  const { resetEnvCacheForTests } = await import("./env");
  resetEnvCacheForTests();
  return import("./seo");
}

describe("organizationJsonLd", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("includes legal name, image and optional contact", async () => {
    const { organizationJsonLd } = await loadSeo();
    const json = organizationJsonLd({
      telephone: "250788937270",
      email: "patrickiradukunda505@gmail.com",
    });
    expect(json["@type"]).toBe("LiquorStore");
    expect(json.legalName).toBe("THE IP SHAP BUSINESS LTD");
    expect(json.telephone).toBe("+250788937270");
    expect(json.email).toBe("patrickiradukunda505@gmail.com");
    expect(json.image).toBe("http://localhost:3000/home/hero.webp");
  });
});

describe("websiteJsonLd", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("exposes SearchAction to the shop query string", async () => {
    const { websiteJsonLd } = await loadSeo();
    const json = websiteJsonLd();
    expect(json["@type"]).toBe("WebSite");
    expect(json.potentialAction["@type"]).toBe("SearchAction");
    expect(json.potentialAction.target.urlTemplate).toBe(
      "http://localhost:3000/shop?q={search_term_string}",
    );
  });
});

describe("faqPageJsonLd", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("mirrors the visible Q&A only", async () => {
    const { faqPageJsonLd } = await loadSeo();
    const json = faqPageJsonLd([
      { question: "How do I order?", answer: "Add bottles to your cart." },
    ]);
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity).toHaveLength(1);
    expect(json.mainEntity[0].name).toBe("How do I order?");
    expect(json.mainEntity[0].acceptedAnswer.text).toBe(
      "Add bottles to your cart.",
    );
  });
});

describe("shopMetadata", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("uses a category canonical for single-category landings", async () => {
    const { shopMetadata } = await loadSeo();
    const meta = shopMetadata({
      category: {
        slug: "wine",
        name: "Wine",
        description: "Red, white and sparkling.",
      },
      hasExtraFilters: false,
    });
    expect(meta.alternates?.canonical).toBe(
      "http://localhost:3000/shop?category=wine",
    );
    expect(meta.title).toBe("Wholesale Wine in Rwanda");
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("keeps /shop canonical and noindex when filters are applied", async () => {
    const { shopMetadata } = await loadSeo();
    const meta = shopMetadata({
      category: {
        slug: "wine",
        name: "Wine",
        description: "Red, white and sparkling.",
      },
      hasExtraFilters: true,
    });
    expect(meta.alternates?.canonical).toBe("http://localhost:3000/shop");
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});

describe("pageMetadata", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("sets canonical and share image for marketing pages", async () => {
    const { pageMetadata } = await loadSeo();
    const meta = pageMetadata({
      title: "Contact",
      description: "Reach IP SHAP in Kigali.",
      path: "/contact",
    });
    expect(meta.alternates?.canonical).toBe("http://localhost:3000/contact");
    expect(meta.openGraph?.images).toEqual([
      { url: "/home/hero.webp", alt: "THE IP SHAP BUSINESS LTD" },
    ]);
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
