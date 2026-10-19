import { moneyRwf } from "@/lib/money";
import type { Brand, Category, DemoProduct } from "@/domain/catalogue";

/**
 * DEMO FIXTURES ONLY — gated by NEXT_PUBLIC_DEMO_MODE.
 * Names, prices and copy are illustrative placeholders for the Phase 01
 * visual prototype. Replace with client-confirmed catalogue data later.
 * Do not seed into production databases.
 */

export const DEMO_CATEGORIES: Category[] = [
  {
    slug: "spirits",
    name: "Spirits",
    description: "Placeholder collection for whiskies, gins and vodkas.",
  },
  {
    slug: "wine",
    name: "Wine",
    description: "Placeholder collection for still and sparkling wines.",
  },
  {
    slug: "ready-to-drink",
    name: "Ready to drink",
    description: "Placeholder collection for lighter pours and mixes.",
  },
];

export const DEMO_BRANDS: Brand[] = [
  { slug: "atelier", name: "Atelier (demo)" },
  { slug: "ridge", name: "Ridge (demo)" },
  { slug: "harbour", name: "Harbour (demo)" },
  { slug: "cedar", name: "Cedar (demo)" },
];

function placeholderImage(
  id: string,
  tone: "warm" | "charcoal" | "neutral",
  label: string,
): DemoProduct["images"][number] {
  return {
    id,
    role: "catalogue_primary",
    src: `/products/placeholders/bottle-${tone}.svg`,
    alt: `Temporary placeholder bottle silhouette for ${label}`,
    width: 800,
    height: 1000,
    sortOrder: 0,
    needsClientConfirmation: true,
  };
}

function secondaryImage(
  id: string,
  tone: "warm" | "charcoal" | "neutral",
  label: string,
): DemoProduct["images"][number] {
  return {
    id,
    role: "catalogue_secondary",
    src: `/products/placeholders/bottle-${tone}-alt.svg`,
    alt: `Temporary alternate placeholder for ${label}`,
    width: 800,
    height: 1000,
    sortOrder: 1,
    needsClientConfirmation: true,
  };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    slug: "demo-cedar-reserve",
    name: "Cedar Reserve (demo)",
    brandSlug: "cedar",
    brandName: "Cedar (demo)",
    categorySlug: "spirits",
    description:
      "Illustrative demo product. Replace with a real IP SHAP catalogue entry once packaging, volume and price are confirmed.",
    price: moneyRwf(45000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [
      placeholderImage("img-101-a", "charcoal", "Cedar Reserve"),
      secondaryImage("img-101-b", "neutral", "Cedar Reserve"),
    ],
    internalNotes: [
      "Placeholder identity — not a verified SKU.",
      "Price is illustrative only.",
    ],
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    slug: "demo-harbour-blanc",
    name: "Harbour Blanc (demo)",
    brandSlug: "harbour",
    brandName: "Harbour (demo)",
    categorySlug: "wine",
    description:
      "Illustrative white-wine placeholder for layout and typography review.",
    price: moneyRwf(18000),
    status: "demo",
    availability: "in_stock",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [placeholderImage("img-102-a", "warm", "Harbour Blanc")],
    internalNotes: ["Availability is fictional for filter UI testing."],
  },
  {
    id: "11111111-1111-4111-8111-111111111103",
    slug: "demo-ridge-noir",
    name: "Ridge Noir (demo)",
    brandSlug: "ridge",
    brandName: "Ridge (demo)",
    categorySlug: "wine",
    description:
      "Illustrative red-wine placeholder. Do not treat tasting notes as real.",
    price: moneyRwf(22000),
    status: "demo",
    availability: "low_stock",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [
      placeholderImage("img-103-a", "charcoal", "Ridge Noir"),
      secondaryImage("img-103-b", "warm", "Ridge Noir"),
    ],
  },
  {
    id: "11111111-1111-4111-8111-111111111104",
    slug: "demo-atelier-citrus",
    name: "Atelier Citrus (demo)",
    brandSlug: "atelier",
    brandName: "Atelier (demo)",
    categorySlug: "spirits",
    description:
      "Illustrative spirit placeholder used to exercise multi-image gallery behaviour.",
    price: moneyRwf(38000),
    status: "demo",
    availability: "in_stock",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [
      placeholderImage("img-104-a", "neutral", "Atelier Citrus"),
      secondaryImage("img-104-b", "charcoal", "Atelier Citrus"),
      {
        id: "img-104-c",
        role: "editorial",
        src: "/products/placeholders/bottle-warm.svg",
        alt: "Temporary editorial placeholder for Atelier Citrus",
        width: 800,
        height: 1000,
        sortOrder: 2,
        needsClientConfirmation: true,
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-111111111105",
    slug: "demo-harbour-sparkling",
    name: "Harbour Sparkling (demo)",
    brandSlug: "harbour",
    brandName: "Harbour (demo)",
    categorySlug: "wine",
    description:
      "Illustrative sparkling placeholder for catalogue density and price sorting.",
    price: moneyRwf(28000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [placeholderImage("img-105-a", "warm", "Harbour Sparkling")],
  },
  {
    id: "11111111-1111-4111-8111-111111111106",
    slug: "demo-ridge-spritz",
    name: "Ridge Spritz Kit (demo)",
    brandSlug: "ridge",
    brandName: "Ridge (demo)",
    categorySlug: "ready-to-drink",
    description:
      "Illustrative ready-to-drink placeholder. Contents and pricing require confirmation.",
    price: moneyRwf(15000),
    status: "demo",
    availability: "out_of_stock",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [placeholderImage("img-106-a", "neutral", "Ridge Spritz Kit")],
  },
  {
    id: "11111111-1111-4111-8111-111111111107",
    slug: "demo-cedar-botanical",
    name: "Cedar Botanical (demo)",
    brandSlug: "cedar",
    brandName: "Cedar (demo)",
    categorySlug: "spirits",
    description:
      "Illustrative botanical spirit placeholder for brand filter patterns.",
    price: moneyRwf(52000),
    status: "demo",
    availability: "in_stock",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [
      placeholderImage("img-107-a", "charcoal", "Cedar Botanical"),
      secondaryImage("img-107-b", "neutral", "Cedar Botanical"),
    ],
  },
  {
    id: "11111111-1111-4111-8111-111111111108",
    slug: "demo-atelier-evening",
    name: "Atelier Evening (demo)",
    brandSlug: "atelier",
    brandName: "Atelier (demo)",
    categorySlug: "ready-to-drink",
    description:
      "Illustrative evening pour placeholder for editorial feature modules.",
    price: moneyRwf(12000),
    status: "demo",
    availability: "in_stock",
    isProvisional: true,
    demoLabel: "Demo sample",
    images: [placeholderImage("img-108-a", "warm", "Atelier Evening")],
  },
];
