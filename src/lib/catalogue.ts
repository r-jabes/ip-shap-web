import type {
  AvailabilityFilter,
  CatalogueFilters,
  DemoProduct,
} from "@/domain/catalogue";
import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
} from "@/fixtures/demo/catalogue";
import { isDemoMode } from "@/lib/env";
import { primaryCatalogueImage } from "@/lib/product-image";
import { availabilityLabel } from "@/lib/shop-query";

export function getCategories() {
  return DEMO_CATEGORIES;
}

export function getBrands() {
  return DEMO_BRANDS;
}

function isStorefrontVisible(product: DemoProduct): boolean {
  return product.status === "published" || product.status === "demo";
}

export function getProductBySlug(slug: string): DemoProduct | undefined {
  if (!isDemoMode()) {
    return undefined;
  }
  const product = DEMO_PRODUCTS.find((row) => row.slug === slug);
  return product && isStorefrontVisible(product) ? product : undefined;
}

export function getProductById(id: string): DemoProduct | undefined {
  if (!isDemoMode()) {
    return undefined;
  }
  const product = DEMO_PRODUCTS.find((row) => row.id === id);
  return product && isStorefrontVisible(product) ? product : undefined;
}

/** Page size for catalogue grids — keeps payloads bounded. */
export const CATALOGUE_PAGE_SIZE = 12;

export function paginateProducts<T>(
  items: T[],
  page: number,
  pageSize = CATALOGUE_PAGE_SIZE,
): { items: T[]; page: number; totalPages: number; total: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
  };
}

function categorySlugsOf(filters: CatalogueFilters): string[] {
  if (filters.categorySlugs?.length) return filters.categorySlugs;
  return filters.categorySlug ? [filters.categorySlug] : [];
}

function brandSlugsOf(filters: CatalogueFilters): string[] {
  if (filters.brandSlugs?.length) return filters.brandSlugs;
  return filters.brandSlug ? [filters.brandSlug] : [];
}

function filterWithoutSort(filters: CatalogueFilters = {}): DemoProduct[] {
  if (!isDemoMode()) {
    return [];
  }

  // Storefront never lists draft/archived products.
  let items = DEMO_PRODUCTS.filter(
    (product) => product.status === "published" || product.status === "demo",
  );

  const categories = categorySlugsOf(filters);
  if (categories.length) {
    items = items.filter(
      (product) =>
        !!product.categorySlug && categories.includes(product.categorySlug),
    );
  }

  const brands = brandSlugsOf(filters);
  if (brands.length) {
    items = items.filter((product) => brands.includes(product.brandSlug));
  }

  if (filters.availability && filters.availability !== "all") {
    if (filters.availability === "in_stock") {
      items = items.filter(
        (product) =>
          product.availability === "in_stock" ||
          product.availability === "low_stock",
      );
    } else if (filters.availability === "unknown") {
      items = items.filter((product) => product.availability === "unknown");
    }
  }

  if (filters.q) {
    const query = filters.q.trim().toLowerCase();
    items = items.filter((product) => {
      const haystack = [
        product.name,
        product.brandName,
        product.description,
        product.categorySlug ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  if (typeof filters.minPrice === "number") {
    items = items.filter(
      (product) => product.price.amount >= filters.minPrice!,
    );
  }

  if (typeof filters.maxPrice === "number") {
    items = items.filter(
      (product) => product.price.amount <= filters.maxPrice!,
    );
  }

  return items;
}

export function listProducts(filters: CatalogueFilters = {}): DemoProduct[] {
  const items = filterWithoutSort(filters);

  switch (filters.sort) {
    case "price_asc":
      items.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price_desc":
      items.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "name_asc":
    default:
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return items;
}

export type FacetOption = {
  slug: string;
  name: string;
  count: number;
};

export type AvailabilityFacet = {
  value: Exclude<AvailabilityFilter, "all">;
  label: string;
  count: number;
};

export type FilterFacets = {
  categories: FacetOption[];
  brands: FacetOption[];
  availability: AvailabilityFacet[];
  priceBounds: { min: number; max: number };
};

/**
 * Facet counts for the shop filters. Each dimension is counted with all other
 * active filters applied (so selecting Wine does not zero the Wine chip).
 */
export function getFilterFacets(filters: CatalogueFilters = {}): FilterFacets {
  const base = filterWithoutSort({});
  const amounts = base.map((product) => product.price.amount);
  const priceBounds = {
    min: amounts.length ? Math.min(...amounts) : 0,
    max: amounts.length ? Math.max(...amounts) : 0,
  };

  const withoutCategory = filterWithoutSort({
    ...filters,
    categorySlug: undefined,
    categorySlugs: undefined,
  });
  const categories = getCategories().map((category) => ({
    slug: category.slug,
    name: category.name,
    count: withoutCategory.filter(
      (product) => product.categorySlug === category.slug,
    ).length,
  }));

  const withoutBrand = filterWithoutSort({
    ...filters,
    brandSlug: undefined,
    brandSlugs: undefined,
  });
  const brands = getBrands().map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    count: withoutBrand.filter((product) => product.brandSlug === brand.slug)
      .length,
  }));

  const withoutAvailability = filterWithoutSort({
    ...filters,
    availability: "all",
  });
  const availability: AvailabilityFacet[] = (
    ["in_stock", "unknown"] as const
  ).map((value) => ({
    value,
    label: availabilityLabel(value),
    count: withoutAvailability.filter((product) => {
      if (value === "in_stock") {
        return (
          product.availability === "in_stock" ||
          product.availability === "low_stock"
        );
      }
      return product.availability === "unknown";
    }).length,
  }));

  return { categories, brands, availability, priceBounds };
}

export function getFeaturedProducts(limit = 4): DemoProduct[] {
  return listProducts({ sort: "name_asc" }).slice(0, limit);
}

function primarySrc(product: DemoProduct): string | undefined {
  return primaryCatalogueImage(product.images)?.src;
}

/** Same brand, other bottles — used as flavour/label chips on the product page. */
export function getBrandSiblings(product: DemoProduct): DemoProduct[] {
  return listProducts({ brandSlugs: [product.brandSlug] }).filter(
    (row) => row.id !== product.id,
  );
}

/**
 * Related drinks: prefer the same range, then fill from the wider catalogue.
 * Always skips bottles that reuse this product's primary photo.
 */
export function getRelatedProducts(
  product: DemoProduct,
  limit = 4,
): DemoProduct[] {
  const ownSrc = primarySrc(product);
  const notSelf = (row: DemoProduct) => row.id !== product.id;
  const notSharedPhoto = (row: DemoProduct) =>
    !ownSrc || primarySrc(row) !== ownSrc;

  const sameRange = product.categorySlug
    ? listProducts({ categorySlugs: [product.categorySlug] }).filter(
        (row) => notSelf(row) && notSharedPhoto(row),
      )
    : [];

  if (sameRange.length >= limit) return sameRange.slice(0, limit);

  const seen = new Set(sameRange.map((row) => row.id));
  const fillers = listProducts()
    .filter((row) => notSelf(row) && notSharedPhoto(row) && !seen.has(row.id))
    .slice(0, limit - sameRange.length);

  return [...sameRange, ...fillers];
}
