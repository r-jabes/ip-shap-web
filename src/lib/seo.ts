import type { Metadata } from "next";
import type { CatalogueProduct, Category } from "@/domain/catalogue";
import { formatDemoPrice } from "@/domain/catalogue";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";
import { getPublicEnv, isDemoMode } from "@/lib/env";
import { primaryCatalogueImage } from "@/lib/product-image";

export function absoluteUrl(path = "/"): string {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Site remains noindex until launch content is confirmed / demo mode off. */
export function defaultRobots(): Metadata["robots"] {
  if (isDemoMode()) {
    return { index: false, follow: false };
  }
  return { index: true, follow: true };
}

const DEFAULT_SHARE_IMAGE = {
  url: "/home/hero.webp",
  alt: LEGAL_NAME,
} as const;

/**
 * Shared metadata for marketing / help pages. Keeps title, description, canonical
 * and Open Graph in sync without inventing contact or delivery claims.
 */
export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  /** Absolute override; otherwise uses the site title template. */
  absoluteTitle?: string;
}): Metadata {
  const url = absoluteUrl(input.path);
  const ogTitle = input.absoluteTitle ?? `${input.title} | ${SHORT_BRAND}`;

  return {
    title: input.absoluteTitle
      ? { absolute: input.absoluteTitle }
      : input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: defaultRobots(),
    openGraph: {
      title: ogTitle,
      description: input.description,
      url,
      type: "website",
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: input.description,
      images: [DEFAULT_SHARE_IMAGE.url],
    },
  };
}

export function shopMetadata(input: {
  category?: Category;
  q?: string;
  hasExtraFilters: boolean;
}): Metadata {
  const category = input.category;
  const categoryName = category?.name;
  const isCategoryLanding = Boolean(category) && !input.hasExtraFilters && !input.q;

  const title = categoryName
    ? `Wholesale ${categoryName} in Rwanda`
    : "Shop wholesale drinks";
  const description = categoryName
    ? `Browse wholesale ${categoryName.toLowerCase()} from ${LEGAL_NAME} in Rwanda. Competitive prices in RWF — add to your cart and check out on this site.`
    : `Browse wholesale wines, spirits, beer and soft drinks from ${LEGAL_NAME} in Rwanda. Prices in RWF.`;

  const robots =
    input.hasExtraFilters || input.q || isDemoMode()
      ? { index: false, follow: true }
      : defaultRobots();

  const canonicalPath =
    isCategoryLanding && category
      ? `/shop?category=${encodeURIComponent(category.slug)}`
      : "/shop";
  const url = absoluteUrl(canonicalPath);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots,
    openGraph: {
      title: `${title} | ${SHORT_BRAND}`,
      description,
      url,
      type: "website",
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SHORT_BRAND}`,
      description,
      images: [DEFAULT_SHARE_IMAGE.url],
    },
  };
}

export function productMetadata(product: CatalogueProduct): Metadata {
  const description = product.description.slice(0, 160);
  const image = primaryCatalogueImage(product.images);
  const url = absoluteUrl(`/product/${product.slug}`);
  const shareImage = image
    ? {
        url: absoluteUrl(image.src),
        width: image.width,
        height: image.height,
        alt: image.alt,
      }
    : DEFAULT_SHARE_IMAGE;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    robots: defaultRobots(),
    openGraph: {
      title: `${product.name} | ${SHORT_BRAND}`,
      description,
      url,
      // Next Metadata Open Graph types do not include "product"; website + Product JSON-LD is the supported pair.
      type: "website",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SHORT_BRAND}`,
      description,
      images: [shareImage.url],
    },
  };
}

/**
 * Product JSON-LD. Never invent reviews/ratings.
 * Availability uses schema.org URLs only from the explicit stock model.
 */
export type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  sku: string;
  brand?: { "@type": "Brand"; name: string };
  image?: string[];
  offers: {
    "@type": "Offer";
    url: string;
    priceCurrency: "RWF";
    price: number;
    availability: string;
    itemCondition: string;
  };
};

export function productJsonLd(product: CatalogueProduct): ProductJsonLd {
  const image = primaryCatalogueImage(product.images);
  const availability = schemaAvailability(product.availability);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    ...(product.brandName
      ? { brand: { "@type": "Brand", name: product.brandName } }
      : {}),
    ...(image ? { image: [absoluteUrl(image.src)] } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: "RWF",
      price: product.price.amount,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

function schemaAvailability(value: CatalogueProduct["availability"]): string {
  switch (value) {
    case "in_stock":
    case "low_stock":
      return "https://schema.org/InStock";
    case "out_of_stock":
      return "https://schema.org/OutOfStock";
    case "unknown":
    default:
      // Do not claim InStock when stock is unknown.
      return "https://schema.org/LimitedAvailability";
  }
}

export function breadcrumbJsonLd(
  crumbs: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Organization / LiquorStore JSON-LD for the homepage. */
export function organizationJsonLd(input?: {
  telephone?: string | null;
  email?: string | null;
  address?: string | null;
  /** Optional social / profile URLs. Only pass real confirmed links. */
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    name: SHORT_BRAND,
    legalName: LEGAL_NAME,
    url: absoluteUrl("/"),
    image: absoluteUrl(DEFAULT_SHARE_IMAGE.url),
    priceRange: "RWF",
    areaServed: "RW",
    description:
      "Wholesale wines, spirits, beer and soft drinks from THE IP SHAP BUSINESS LTD in Rwanda.",
    ...(input?.telephone
      ? {
          telephone: input.telephone.startsWith("+")
            ? input.telephone
            : `+${input.telephone}`,
        }
      : {}),
    ...(input?.email ? { email: input.email } : {}),
    ...(input?.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: input.address,
            addressCountry: "RW",
          },
        }
      : {}),
    ...(input?.sameAs?.length ? { sameAs: input.sameAs } : {}),
  };
}

/** WebSite + SearchAction so engines can surface on-site search. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SHORT_BRAND,
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** FAQPage JSON-LD. Pass the same Q&A shown on the page — never invent answers. */
export function faqPageJsonLd(
  items: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function formatPriceForSeo(product: CatalogueProduct): string {
  return formatDemoPrice(product.price);
}
