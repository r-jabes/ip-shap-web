import type {
  AvailabilityFilter,
  CatalogueFilters,
  DemoProduct,
} from "@/domain/catalogue";

/** The few fields filtering needs, so the same rules run on full products and on the slim index. */
export type FilterableProduct = {
  status: string;
  name: string;
  brandName: string;
  brandSlug: string;
  description?: string;
  categorySlug?: string;
  availability: DemoProduct["availability"];
  price: { amount: number };
};

function categorySlugsOf(filters: CatalogueFilters): string[] {
  if (filters.categorySlugs?.length) return filters.categorySlugs;
  return filters.categorySlug ? [filters.categorySlug] : [];
}

function brandSlugsOf(filters: CatalogueFilters): string[] {
  if (filters.brandSlugs?.length) return filters.brandSlugs;
  return filters.brandSlug ? [filters.brandSlug] : [];
}

export function isStorefrontVisible(product: { status: string }): boolean {
  return product.status === "published" || product.status === "demo";
}

/** Shared filter/sort used by memory + post-fetch Supabase paths and the slim catalogue index. */
export function filterAndSortProducts<T extends FilterableProduct>(
  source: T[],
  filters: CatalogueFilters = {},
): T[] {
  let items = source.filter(isStorefrontVisible);

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
        product.description ?? "",
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

export type { AvailabilityFilter };
