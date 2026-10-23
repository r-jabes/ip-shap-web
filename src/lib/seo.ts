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

export function shopMetadata(input: {
  category?: Category;
  q?: string;
  hasExtraFilters: boolean;
}): Metadata {
  const categoryName = input.category?.name;
  const title = categoryName ? `${categoryName} drinks` : "Shop drinks";
  const description = categoryName
    ? `Browse ${categoryName} from ${LEGAL_NAME}. Prices in RWF.`
    : `Browse drinks from ${LEGAL_NAME}. Prices in RWF.`;

  const robots =
    input.hasExtraFilters || input.q || isDemoMode()
      ? { index: false, follow: true }
      : defaultRobots();

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/shop") },
    robots,
    openGraph: {
      title: `${title} | ${SHORT_BRAND}`,
      description,
      url: absoluteUrl("/shop"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SHORT_BRAND}`,
      description,
    },
  };
}

export function productMetadata(product: CatalogueProduct): Metadata {
  const description = product.description.slice(0, 160);
  const image = primaryCatalogueImage(product.images);
  const url = absoluteUrl(`/product/${product.slug}`);

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    robots: defaultRobots(),
    openGraph: {
      title: `${product.name} | ${SHORT_BRAND}`,
      description,
      url,
      type: "website",
      images: image
        ? [
            {
              url: absoluteUrl(image.src),
              width: image.width,
              height: image.height,
              alt: image.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ${SHORT_BRAND}`,
      description,
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LiquorStore",
    name: SHORT_BRAND,
    legalName: LEGAL_NAME,
    url: absoluteUrl("/"),
    priceRange: "RWF",
    areaServed: "RW",
    ...(input?.telephone
      ? { telephone: input.telephone.startsWith("+") ? input.telephone : `+${input.telephone}` }
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
  };
}

export function formatPriceForSeo(product: CatalogueProduct): string {
  return formatDemoPrice(product.price);
}
