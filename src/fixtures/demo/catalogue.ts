import { moneyRwf } from "@/lib/money";
import type { Brand, Category, DemoProduct } from "@/domain/catalogue";

/**
 * DEMO FIXTURES — gated by NEXT_PUBLIC_DEMO_MODE (internal documentation only).
 * Sourced from client photographs in ../resources/ (copied to public/products/).
 * Prices inferred from filenames and names read from labels still need owner
 * confirmation (see `isProvisional`, `internalNotes`, `needsClientConfirmation`).
 * That status is NEVER rendered to shoppers; the storefront shows the data as a
 * normal catalogue and the admin area exposes the confirmation flags.
 * Do not seed into production databases.
 */

const PHOTO = {
  rozzita: "/products/drink-12000.jpeg",
  pinta: "/products/drink-13000.jpeg",
  valdepablo: "/products/drink-17000.jpeg",
  liboll: "/products/drink-20000.jpeg",
  gin: "/products/drink-60000.jpeg",
  johnnie: "/products/drink-28000-68000-78000.jpeg",
} as const;

const SIZE = { width: 810, height: 1080 } as const;

export const DEMO_CATEGORIES: Category[] = [
  {
    slug: "whisky",
    name: "Whisky",
    group: "Spirits",
    description: "Blended Scotch and other whiskies.",
  },
  {
    slug: "vodka",
    name: "Vodka",
    group: "Spirits",
    description: "Classic and flavoured vodkas.",
  },
  {
    slug: "gin",
    name: "Gin",
    group: "Spirits",
    description: "Dry, organic and botanical gins.",
  },
  {
    slug: "wine",
    name: "Wine",
    group: "Wine",
    description: "Red, white and fortified wines.",
  },
  {
    slug: "sparkling",
    name: "Sparkling",
    group: "Wine",
    description: "Sparkling whites and rosés for celebrations.",
  },
];

export const DEMO_BRANDS: Brand[] = [
  { slug: "rozzita", name: "ROZZITA" },
  { slug: "adegamae", name: "ADEGAMÃE" },
  { slug: "valdepablo", name: "Valdepablo" },
  { slug: "liboll", name: "LIBOLL" },
  { slug: "grands-domaines", name: "Grands Domaines" },
  { slug: "johnnie-walker", name: "Johnnie Walker" },
];

function sharedPhoto(
  id: string,
  src: string,
  alt: string,
  sourceFilename: string,
  sortOrder = 0,
): DemoProduct["images"][number] {
  return {
    id,
    role: "catalogue_primary",
    src,
    // Zoom reuses the same public derivative until dedicated zoom exports exist.
    zoomSrc: src,
    alt,
    width: SIZE.width,
    height: SIZE.height,
    sortOrder,
    processingStatus: "needs_review",
    isSharedMultiProductPhoto: true,
    sourceFilename,
    originalRef: `resources/${sourceFilename}`,
    cropInstructions:
      "Keep full bottles in frame; do not crop labels. Prefer individual SKU retakes before aggressive cut-out.",
    rightsNote: "Client-supplied shop photograph for THE IP SHAP BUSINESS LTD.",
    needsClientConfirmation: true,
  };
}

function singlePhoto(
  id: string,
  src: string,
  alt: string,
  sourceFilename: string,
): DemoProduct["images"][number] {
  return {
    id,
    role: "catalogue_primary",
    src,
    zoomSrc: src,
    alt,
    width: SIZE.width,
    height: SIZE.height,
    sortOrder: 0,
    processingStatus: "needs_review",
    isSharedMultiProductPhoto: false,
    sourceFilename,
    originalRef: `resources/${sourceFilename}`,
    cropInstructions:
      "Centre bottle on 4:5 canvas; preserve glass edges and label text; avoid aggressive background removal.",
    rightsNote: "Client-supplied shop photograph for THE IP SHAP BUSINESS LTD.",
    needsClientConfirmation: true,
  };
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "22222222-2222-4222-8222-222222222001",
    slug: "product-001-rozzita-chocolate",
    name: "ROZZITA Chocolate",
    brandSlug: "rozzita",
    brandName: "ROZZITA",
    categorySlug: "vodka",
    description:
      "Frosted-glass vodka with a chocolate flavour from the ROZZITA range.",
    price: moneyRwf(12000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-001",
        PHOTO.rozzita,
        "Four frosted vodka bottles on a shop counter; chocolate flavour appears on the left",
        "12k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 12k.jpeg → provisional 12,000 RWF (which bottle the price applies to is unconfirmed).",
      "Shared multi-product photograph — needs individual product photos.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222002",
    slug: "product-002-rozzita-raspberry",
    name: "ROZZITA Raspberry",
    brandSlug: "rozzita",
    brandName: "ROZZITA",
    categorySlug: "vodka",
    description:
      "Frosted-glass vodka with a raspberry flavour from the ROZZITA range.",
    price: moneyRwf(12000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-002",
        PHOTO.rozzita,
        "Four frosted vodka bottles on a shop counter; raspberry flavour appears second from left",
        "12k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 12k.jpeg — shared price and photo pending confirmation.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222003",
    slug: "product-003-rozzita-original",
    name: "ROZZITA Original",
    brandSlug: "rozzita",
    brandName: "ROZZITA",
    categorySlug: "vodka",
    description:
      "The original, unflavoured vodka from the ROZZITA range in a frosted-glass bottle.",
    price: moneyRwf(12000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-003",
        PHOTO.rozzita,
        "Four frosted vodka bottles on a shop counter; original flavour appears third from left",
        "12k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 12k.jpeg — shared price and photo pending confirmation.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222004",
    slug: "product-004-rozzita-green-apple",
    name: "ROZZITA Green Apple",
    brandSlug: "rozzita",
    brandName: "ROZZITA",
    categorySlug: "vodka",
    description:
      "Frosted-glass vodka with a green apple flavour from the ROZZITA range.",
    price: moneyRwf(12000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-004",
        PHOTO.rozzita,
        "Four frosted vodka bottles on a shop counter; green apple flavour appears on the right",
        "12k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 12k.jpeg — shared price and photo pending confirmation.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222005",
    slug: "product-005-pinta-negra-red",
    name: "Pinta Negra Red 2024",
    brandSlug: "adegamae",
    brandName: "ADEGAMÃE",
    categorySlug: "wine",
    description:
      "Pinta Negra red wine (tinto) from Lisboa, Portugal, vintage 2024, by Adegamãe.",
    price: moneyRwf(13000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-005",
        PHOTO.pinta,
        "Two wine bottles on a wooden surface; dark-glass red wine bottle on the left",
        "13k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 13k.jpeg → provisional 13,000 RWF; unclear if price is per bottle or applies to one SKU only.",
      "Shared multi-product photograph.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222006",
    slug: "product-006-pinta-negra-white",
    name: "Pinta Negra White 2024",
    brandSlug: "adegamae",
    brandName: "ADEGAMÃE",
    categorySlug: "wine",
    description:
      "Pinta Negra white wine (branco) from Lisboa, Portugal, vintage 2024, by Adegamãe.",
    price: moneyRwf(13000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-006",
        PHOTO.pinta,
        "Two wine bottles on a wooden surface; clear-glass white wine bottle on the right",
        "13k.jpeg",
      ),
    ],
    internalNotes: ["Source: 13k.jpeg — shared price assignment unconfirmed."],
  },
  {
    id: "22222222-2222-4222-8222-222222222007",
    slug: "product-007-valdepablo-consagrar",
    name: "Valdepablo Vino Para Consagrar",
    brandSlug: "valdepablo",
    brandName: "Valdepablo",
    categorySlug: "wine",
    description:
      "Valdepablo Vino Para Consagrar, a liqueur wine in a classic green glass bottle.",
    price: moneyRwf(17000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      singlePhoto(
        "img-007",
        PHOTO.valdepablo,
        "Green glass wine bottle with ornate cream label, held upright in a shop setting",
        "17k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 17k.jpeg → provisional 17,000 RWF.",
      "Hand visible in source photo — consider a cleaner retake for catalogue.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222008",
    slug: "product-008-liboll-rose",
    name: "LIBOLL Rosé Extra Dry",
    brandSlug: "liboll",
    brandName: "LIBOLL",
    categorySlug: "sparkling",
    description: "LIBOLL Rosé Extra Dry, a sparkling rosé.",
    price: moneyRwf(20000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-008",
        PHOTO.liboll,
        "Two sparkling wine bottles; pink rosé bottle with white foil on the left",
        "20k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 20k.jpeg → provisional 20,000 RWF; price-to-bottle mapping unconfirmed.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222009",
    slug: "product-009-liboll-extra-dry",
    name: "LIBOLL Extra Dry",
    brandSlug: "liboll",
    brandName: "LIBOLL",
    categorySlug: "sparkling",
    description: "LIBOLL Extra Dry, a sparkling white wine.",
    price: moneyRwf(20000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-009",
        PHOTO.liboll,
        "Two sparkling wine bottles; pale wine bottle with blue foil on the right",
        "20k.jpeg",
      ),
    ],
    internalNotes: ["Source: 20k.jpeg — shared price assignment unconfirmed."],
  },
  {
    id: "22222222-2222-4222-8222-222222222010",
    slug: "product-010-grands-domaines-gin-bio",
    name: "Grands Domaines Gin Bio",
    brandSlug: "grands-domaines",
    brandName: "Grands Domaines",
    categorySlug: "gin",
    description:
      "Grands Domaines Gin Bio, an organic single-estate gin from France, presented with its kraft gift box.",
    price: moneyRwf(60000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      singlePhoto(
        "img-010",
        PHOTO.gin,
        "Clear gin bottle beside a kraft gift box with tree emblem on a wooden surface",
        "60k.jpeg",
      ),
    ],
    internalNotes: ["Source: 60k.jpeg → provisional 60,000 RWF."],
  },
  {
    id: "22222222-2222-4222-8222-222222222011",
    slug: "product-011-johnnie-walker-red-label",
    name: "Johnnie Walker Red Label",
    brandSlug: "johnnie-walker",
    brandName: "Johnnie Walker",
    categorySlug: "whisky",
    description: "Johnnie Walker Red Label, a blended Scotch whisky.",
    price: moneyRwf(28000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-011",
        PHOTO.johnnie,
        "Three Johnnie Walker bottles in a row; Red Label appears on the left",
        "28k-68k-78k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 28k-68k-78k.jpeg → provisional 28,000 RWF assumed for left bottle (Red Label).",
      "MAPPING UNCONFIRMED — confirm with Rosine before launch.",
      "Shared multi-product photograph — replace with individual SKU photos.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222012",
    slug: "product-012-johnnie-walker-black-label",
    name: "Johnnie Walker Black Label",
    brandSlug: "johnnie-walker",
    brandName: "Johnnie Walker",
    categorySlug: "whisky",
    description:
      "Johnnie Walker Black Label, a blended Scotch whisky aged 12 years.",
    price: moneyRwf(68000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-012",
        PHOTO.johnnie,
        "Three Johnnie Walker bottles in a row; Black Label appears in the centre",
        "28k-68k-78k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 28k-68k-78k.jpeg → provisional 68,000 RWF assumed for centre bottle (Black Label).",
      "MAPPING UNCONFIRMED.",
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222013",
    slug: "product-013-johnnie-walker-double-black",
    name: "Johnnie Walker Double Black",
    brandSlug: "johnnie-walker",
    brandName: "Johnnie Walker",
    categorySlug: "whisky",
    description:
      "Johnnie Walker Double Black, a smoky blended Scotch whisky matured in deep charred oak casks.",
    price: moneyRwf(78000),
    status: "demo",
    availability: "unknown",
    isProvisional: true,
    demoLabel: "Provisional",
    images: [
      sharedPhoto(
        "img-013",
        PHOTO.johnnie,
        "Three Johnnie Walker bottles in a row; Double Black appears on the right",
        "28k-68k-78k.jpeg",
      ),
    ],
    internalNotes: [
      "Source: 28k-68k-78k.jpeg → provisional 78,000 RWF assumed for right bottle (Double Black).",
      "MAPPING UNCONFIRMED.",
    ],
  },
];
