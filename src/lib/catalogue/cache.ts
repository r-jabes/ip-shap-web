import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import type { Brand, Category, DemoProduct } from "@/domain/catalogue";
import { getCatalogueRepository } from "@/lib/catalogue/get-repository";

/** Cache tag for published catalogue — bust on admin publish/archive. */
export const CATALOGUE_CACHE_TAG = "catalogue";

const REVALIDATE_SECONDS = 3600;

export async function getCachedPublishedProducts(): Promise<DemoProduct[]> {
  return unstable_cache(
    async () => getCatalogueRepository().listProducts({ sort: "name_asc" }),
    ["catalogue-published-products"],
    { tags: [CATALOGUE_CACHE_TAG], revalidate: REVALIDATE_SECONDS },
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
