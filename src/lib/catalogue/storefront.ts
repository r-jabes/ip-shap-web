import type { CatalogueFilters, DemoProduct } from "@/domain/catalogue";
import {
  getCachedBrands,
  getCachedCategories,
  getCachedFeaturedProducts,
  getCachedIndex,
  getCachedProductsByIds,
  getCachedSearchIds,
} from "@/lib/catalogue/cache";
import {
  applyFilters,
  computeFacets,
  lowestPrice,
  lowestPriceAcross,
  paginate,
  relatedCandidateIds,
  siblingIds,
} from "@/lib/catalogue/query";
import { moneyRwf, type MoneyRwf } from "@/lib/money";
import { buildNavDataFromIndex, type NavData } from "@/lib/navigation";
import { primaryCatalogueImage } from "@/lib/product-image";
import {
  getHomeCollections,
  HOME_RANGE_GROUPS,
  type HomeCollectionTile,
  type HomeRangeGroupSlug,
} from "@/lib/range-media";

/**
 * Storefront reads. Everything comes from the cached slim index; full product rows are loaded
 * only for the handful of products on screen, so cost no longer grows with catalogue size.
 */

export const SHOP_PAGE_SIZE = 12;

/** One page of the shop plus the filter counts for it. */
export async function getShopListing(filters: CatalogueFilters, page: number) {
  const [index, categories, brands] = await Promise.all([
    getCachedIndex(),
    getCachedCategories(),
    getCachedBrands(),
  ]);

  // Free text: let the database match (typo tolerant); otherwise match on the index.
  let searchIds: Set<string> | null = null;
  const text = filters.q?.trim();
  if (text) {
    const ids = await getCachedSearchIds(text);
    if (ids) searchIds = new Set(ids);
  }

  const matches = applyFilters(index, filters, searchIds);
  const facets = computeFacets(index, categories, brands, filters, searchIds);
  const paged = paginate(matches, page, SHOP_PAGE_SIZE);
  const products = await getCachedProductsByIds(
    paged.items.map((entry) => entry.id),
  );

  return {
    products,
    page: paged.page,
    totalPages: paged.totalPages,
    total: paged.total,
    facets,
    categories,
    brands,
  };
}

export async function getProductSiblings(
  product: DemoProduct,
): Promise<DemoProduct[]> {
  const index = await getCachedIndex();
  return getCachedProductsByIds(siblingIds(index, product));
}

/** Other drinks to look at, skipping any that reuse this product's photo. */
export async function getRelatedForProduct(
  product: DemoProduct,
  limit = 4,
): Promise<DemoProduct[]> {
  const index = await getCachedIndex();
  const candidates = await getCachedProductsByIds(
    relatedCandidateIds(index, product, limit),
  );
  const ownSrc = primaryCatalogueImage(product.images)?.src;
  return candidates
    .filter(
      (row) =>
        !ownSrc || primaryCatalogueImage(row.images)?.src !== ownSrc,
    )
    .slice(0, limit);
}

/**
 * Header menu data: category counts from the index, plus the first product an admin has
 * featured for the menu's feature tile (no tile when nothing is featured).
 */
export async function getNavData(): Promise<NavData> {
  const [index, categories, featured] = await Promise.all([
    getCachedIndex(),
    getCachedCategories(),
    getCachedFeaturedProducts(1),
  ]);
  return buildNavDataFromIndex(index, categories, featured[0]);
}

/** Per-category product counts for the home page ticker. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const index = await getCachedIndex();
  const counts: Record<string, number> = {};
  for (const entry of index) {
    if (entry.categorySlug) {
      counts[entry.categorySlug] = (counts[entry.categorySlug] ?? 0) + 1;
    }
  }
  return counts;
}

export async function getLowestPrice(
  categorySlug: string,
): Promise<MoneyRwf | null> {
  const amount = lowestPrice(await getCachedIndex(), categorySlug);
  return amount === null ? null : moneyRwf(amount);
}

/** Home page collection tiles with "from" prices taken from the live catalogue. */
export async function getHomeCollectionsDurable(): Promise<
  HomeCollectionTile[]
> {
  const [index, categories] = await Promise.all([
    getCachedIndex(),
    getCachedCategories(),
  ]);
  const existingCategories = new Set(categories.map((c) => c.slug));
  const price = (slugs: readonly string[]): MoneyRwf | null => {
    const amount = lowestPriceAcross(index, slugs);
    return amount === null ? null : moneyRwf(amount);
  };
  const prices = Object.fromEntries(
    HOME_RANGE_GROUPS.map((group) => [group.slug, price(group.categorySlugs)]),
  ) as Partial<Record<HomeRangeGroupSlug, MoneyRwf | null>>;
  return getHomeCollections({ prices, existingCategories });
}

/** Every public product address, for the sitemap and static generation. */
export async function getAllProductSlugs(): Promise<string[]> {
  return (await getCachedIndex()).map((entry) => entry.slug);
}
