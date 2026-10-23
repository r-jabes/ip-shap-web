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
import {
  filterAndSortProducts,
  isStorefrontVisible,
} from "@/lib/catalogue/filter";
import { getCatalogueRepository } from "@/lib/catalogue/get-repository";
import { isDemoMode } from "@/lib/env";
import { primaryCatalogueImage } from "@/lib/product-image";
import { availabilityLabel } from "@/lib/shop-query";

/**
 * Sync storefront helpers.
 * Demo mode → fixtures. Production path → empty until pages call the async
 * repository (`getCatalogueRepository`). Fail closed: never leak fixtures when
 * `NEXT_PUBLIC_DEMO_MODE=false`.
 */

export function getCategories() {
  return isDemoMode() ? DEMO_CATEGORIES : [];
}

export function getBrands() {
  return isDemoMode() ? DEMO_BRANDS : [];
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

function filterWithoutSort(filters: CatalogueFilters = {}): DemoProduct[] {
  if (!isDemoMode()) {
    return [];
  }
  // Facets ignore sort; force a stable order for deterministic counts.
  return filterAndSortProducts(DEMO_PRODUCTS, {
    ...filters,
    sort: "name_asc",
  });
}

export function listProducts(filters: CatalogueFilters = {}): DemoProduct[] {
  if (!isDemoMode()) {
    return [];
  }
  return filterAndSortProducts(DEMO_PRODUCTS, filters);
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
  if (!product.brandSlug) return [];
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

/** Async durable catalogue — use from Server Components / actions (P6+). */
export async function listProductsDurable(
  filters: CatalogueFilters = {},
): Promise<DemoProduct[]> {
  return getCatalogueRepository().listProducts(filters);
}

export async function getProductBySlugDurable(
  slug: string,
): Promise<DemoProduct | undefined> {
  return getCatalogueRepository().getProductBySlug(slug);
}

export async function getProductByIdDurable(
  id: string,
): Promise<DemoProduct | undefined> {
  return getCatalogueRepository().getProductById(id);
}

export async function getCategoriesDurable() {
  return getCatalogueRepository().listCategories();
}

export async function getBrandsDurable() {
  return getCatalogueRepository().listBrands();
}

export async function getFeaturedProductsDurable(limit = 4) {
  return getCatalogueRepository().getFeaturedProducts(limit);
}

export async function getFilterFacetsDurable(
  filters: CatalogueFilters = {},
): Promise<FilterFacets> {
  const repo = getCatalogueRepository();
  const [all, categories, brands] = await Promise.all([
    repo.listProducts({ sort: "name_asc" }),
    repo.listCategories(),
    repo.listBrands(),
  ]);

  const amounts = all.map((product) => product.price.amount);
  const priceBounds = {
    min: amounts.length ? Math.min(...amounts) : 0,
    max: amounts.length ? Math.max(...amounts) : 0,
  };

  const withoutCategory = filterAndSortProducts(all, {
    ...filters,
    categorySlug: undefined,
    categorySlugs: undefined,
    sort: "name_asc",
  });
  const categoryFacets = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    count: withoutCategory.filter(
      (product) => product.categorySlug === category.slug,
    ).length,
  }));

  const withoutBrand = filterAndSortProducts(all, {
    ...filters,
    brandSlug: undefined,
    brandSlugs: undefined,
    sort: "name_asc",
  });
  const brandFacets = brands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    count: withoutBrand.filter((product) => product.brandSlug === brand.slug)
      .length,
  }));

  const withoutAvailability = filterAndSortProducts(all, {
    ...filters,
    availability: "all",
    sort: "name_asc",
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

  return {
    categories: categoryFacets,
    brands: brandFacets,
    availability,
    priceBounds,
  };
}

export async function getBrandSiblingsDurable(
  product: DemoProduct,
): Promise<DemoProduct[]> {
  if (!product.brandSlug) return [];
  const siblings = await listProductsDurable({
    brandSlugs: [product.brandSlug],
  });
  return siblings.filter((row) => row.id !== product.id);
}

export async function getRelatedProductsDurable(
  product: DemoProduct,
  limit = 4,
): Promise<DemoProduct[]> {
  const all = await listProductsDurable({ sort: "name_asc" });
  const ownSrc = primarySrc(product);
  const notSelf = (row: DemoProduct) => row.id !== product.id;
  const notSharedPhoto = (row: DemoProduct) =>
    !ownSrc || primarySrc(row) !== ownSrc;

  const sameRange = product.categorySlug
    ? all.filter(
        (row) =>
          row.categorySlug === product.categorySlug &&
          notSelf(row) &&
          notSharedPhoto(row),
      )
    : [];

  if (sameRange.length >= limit) return sameRange.slice(0, limit);

  const seen = new Set(sameRange.map((row) => row.id));
  const fillers = all
    .filter((row) => notSelf(row) && notSharedPhoto(row) && !seen.has(row.id))
    .slice(0, limit - sameRange.length);

  return [...sameRange, ...fillers];
}

export { getCatalogueRepository };
