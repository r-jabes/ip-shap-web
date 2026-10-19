import type { CatalogueFilters, DemoProduct } from "@/domain/catalogue";
import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
} from "@/fixtures/demo/catalogue";
import { isDemoMode } from "@/lib/env";

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

export function listProducts(filters: CatalogueFilters = {}): DemoProduct[] {
  if (!isDemoMode()) {
    return [];
  }

  // Storefront never lists draft/archived products.
  let items = DEMO_PRODUCTS.filter(
    (product) => product.status === "published" || product.status === "demo",
  );

  if (filters.categorySlug) {
    items = items.filter(
      (product) => product.categorySlug === filters.categorySlug,
    );
  }

  if (filters.brandSlug) {
    items = items.filter((product) => product.brandSlug === filters.brandSlug);
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

export function getFeaturedProducts(limit = 4): DemoProduct[] {
  return listProducts({ sort: "name_asc" }).slice(0, limit);
}
