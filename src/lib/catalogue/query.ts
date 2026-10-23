import type {
  Brand,
  CatalogueFilters,
  Category,
  DemoProduct,
} from "@/domain/catalogue";
import type {
  AvailabilityFacet,
  FacetOption,
  FilterFacets,
} from "@/lib/catalogue";
import {
  filterAndSortProducts,
  isStorefrontVisible,
} from "@/lib/catalogue/filter";
import type { CatalogueIndexEntry } from "@/lib/catalogue/repository";
import { availabilityLabel } from "@/lib/shop-query";

/**
 * Pure query helpers over the slim catalogue index (no framework imports, so they are easy to
 * test). The server wrappers in `storefront.ts` add caching and fetch full rows for one page.
 */

/** Applies shop filters. When the database already matched the free text, pass its ids. */
export function applyFilters(
  index: CatalogueIndexEntry[],
  filters: CatalogueFilters,
  searchIds?: Set<string> | null,
): CatalogueIndexEntry[] {
  if (searchIds) {
    return filterAndSortProducts(
      index.filter((entry) => searchIds.has(entry.id)),
      { ...filters, q: undefined },
    );
  }
  return filterAndSortProducts(index, filters);
}

export function computeFacets(
  index: CatalogueIndexEntry[],
  categories: Category[],
  brands: Brand[],
  filters: CatalogueFilters,
  searchIds?: Set<string> | null,
): FilterFacets {
  const count = (extra: CatalogueFilters) =>
    applyFilters(index, { ...filters, ...extra, sort: "name_asc" }, searchIds);

  const amounts = index.map((entry) => entry.price.amount);
  const priceBounds = {
    min: amounts.length ? Math.min(...amounts) : 0,
    max: amounts.length ? Math.max(...amounts) : 0,
  };

  const withoutCategory = count({
    categorySlug: undefined,
    categorySlugs: undefined,
  });
  const categoryFacets: FacetOption[] = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    count: withoutCategory.filter(
      (entry) => entry.categorySlug === category.slug,
    ).length,
  }));

  const withoutBrand = count({ brandSlug: undefined, brandSlugs: undefined });
  const brandFacets: FacetOption[] = brands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    count: withoutBrand.filter((entry) => entry.brandSlug === brand.slug)
      .length,
  }));

  const withoutAvailability = count({ availability: "all" });
  const availability: AvailabilityFacet[] = (
    ["in_stock", "unknown"] as const
  ).map((value) => ({
    value,
    label: availabilityLabel(value),
    count: withoutAvailability.filter((entry) =>
      value === "in_stock"
        ? entry.availability === "in_stock" ||
          entry.availability === "low_stock"
        : entry.availability === "unknown",
    ).length,
  }));

  return {
    categories: categoryFacets,
    brands: brandFacets,
    availability,
    priceBounds,
  };
}

export type Page<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
};

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
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

/** Ids of the other products from the same brand (empty when the product has no brand). */
export function siblingIds(
  index: CatalogueIndexEntry[],
  product: Pick<DemoProduct, "id" | "brandSlug">,
): string[] {
  if (!product.brandSlug) return [];
  return index
    .filter(
      (entry) =>
        isStorefrontVisible(entry) &&
        entry.brandSlug === product.brandSlug &&
        entry.id !== product.id,
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => entry.id);
}

/**
 * Candidate ids for "related drinks": the same range first, then others. Callers load the full
 * rows and drop any that reuse the product's own photo, so more candidates than needed are returned.
 */
export function relatedCandidateIds(
  index: CatalogueIndexEntry[],
  product: Pick<DemoProduct, "id" | "categorySlug">,
  limit: number,
): string[] {
  const pool = limit * 3;
  const others = index
    .filter((entry) => isStorefrontVisible(entry) && entry.id !== product.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const sameRange = product.categorySlug
    ? others.filter((entry) => entry.categorySlug === product.categorySlug)
    : [];
  const taken = new Set(sameRange.map((entry) => entry.id));
  const rest = others.filter((entry) => !taken.has(entry.id));
  return [...sameRange, ...rest].slice(0, pool).map((entry) => entry.id);
}

/** Lowest price in a category, or null when it has no products. */
export function lowestPrice(
  index: CatalogueIndexEntry[],
  categorySlug: string,
): number | null {
  const amounts = index
    .filter(
      (entry) =>
        isStorefrontVisible(entry) && entry.categorySlug === categorySlug,
    )
    .map((entry) => entry.price.amount);
  return amounts.length ? Math.min(...amounts) : null;
}
