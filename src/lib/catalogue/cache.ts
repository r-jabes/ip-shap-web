import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import type { Brand, Category, DemoProduct } from "@/domain/catalogue";
import { getCatalogueRepository } from "@/lib/catalogue/get-repository";
import type { CatalogueIndexEntry } from "@/lib/catalogue/repository";

/** Cache tag for published catalogue — bust on admin publish/archive. */
export const CATALOGUE_CACHE_TAG = "catalogue";

const REVALIDATE_SECONDS = 3600;

/**
 * Slim index of every published product (no images or descriptions). This is what the shop,
 * menus, counts and sitemap read; full rows are loaded only for the products actually shown.
 */
export async function getCachedIndex(): Promise<CatalogueIndexEntry[]> {
  return unstable_cache(
    async () => getCatalogueRepository().listIndex(),
    ["catalogue-index"],
    { tags: [CATALOGUE_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
  )();
}

/** Full product rows for a handful of ids (one shop page, related items, a menu tile). */
export async function getCachedProductsByIds(
  ids: string[],
): Promise<DemoProduct[]> {
  const unique = [...new Set(ids)].slice(0, 100);
  if (unique.length === 0) return [];
  return unstable_cache(
    async () => getCatalogueRepository().getProductsByIds(unique),
    ["catalogue-products-by-id", ...unique],
    { tags: [CATALOGUE_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
  )();
}

/** Ids matching a shop search, or null when matching should happen on the index instead. */
export async function getCachedSearchIds(
  query: string,
): Promise<string[] | null> {
  const normalized = query.trim().toLowerCase().slice(0, 80);
  return unstable_cache(
    async () => getCatalogueRepository().searchProductIds(normalized),
    ["catalogue-search-ids", normalized],
    { tags: [CATALOGUE_CACHE_TAG], revalidate: 300 },
  )();
}

export async function getCachedCategories(): Promise<Category[]> {
  return unstable_cache(
    async () => getCatalogueRepository().listCategories(),
    ["catalogue-categories"],
    { tags: [CATALOGUE_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
  )();
}

export async function getCachedBrands(): Promise<Brand[]> {
  return unstable_cache(
    async () => getCatalogueRepository().listBrands(),
    ["catalogue-brands"],
    { tags: [CATALOGUE_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
  )();
}

export async function getCachedFeaturedProducts(
  limit = 4,
): Promise<DemoProduct[]> {
  return unstable_cache(
    async () => getCatalogueRepository().getFeaturedProducts(limit),
    [`catalogue-featured-${limit}`],
    { tags: [CATALOGUE_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
  )();
}

/**
 * Call after orders reserve or restore stock. Only drops the cached catalogue data; storefront
 * clients also read live stock from `/api/stock`, so this just keeps server-rendered pages honest.
 */
export function revalidateCatalogueStock() {
  try {
    revalidateTag(CATALOGUE_CACHE_TAG);
  } catch {
    // Not in a request context (tests, scripts): nothing to revalidate.
  }
}

/** Call after catalogue writes that affect the public storefront. */
export function revalidateCatalogue() {
  revalidateTag(CATALOGUE_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/sitemap.xml");
}
