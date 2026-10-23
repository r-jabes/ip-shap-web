import type { Category, DemoProduct } from "@/domain/catalogue";
import { listProducts } from "@/lib/catalogue";
import { normalizeSearchText } from "@/lib/search-normalize";
import { primaryCatalogueImage } from "@/lib/product-image";

/**
 * Instant search suggestions for the header overlay.
 * Ranking: name starts-with > any word starts-with > contains in name/brand/category.
 * Works on the storefront adapter, so it keeps working when the data source changes.
 * (A server/Postgres implementation replaces this in the data phase.)
 */
export type ProductSuggestion = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  priceAmount: number;
  imageSrc: string | null;
  imageAlt: string;
};

function score(product: DemoProduct, query: string, categoryName: string) {
  const name = normalizeSearchText(product.name);
  if (name.startsWith(query)) return 100;
  if (name.split(/\s+/).some((word) => word.startsWith(query))) return 80;
  if (name.includes(query)) return 60;
  const brand = normalizeSearchText(product.brandName);
  if (brand && brand.includes(query)) return 40;
  if (normalizeSearchText(categoryName).includes(query)) return 30;
  return 0;
}

export function suggestProducts(
  rawQuery: string,
  categories: Category[],
  limit = 6,
  catalogue: DemoProduct[] = listProducts(),
): ProductSuggestion[] {
  const query = normalizeSearchText(rawQuery).slice(0, 80);
  if (query.length < 2) return [];
  const categoryName = (slug?: string) =>
    categories.find((category) => category.slug === slug)?.name ?? "";

  return catalogue
    .map((product) => ({
      product,
      score: score(product, query, categoryName(product.categorySlug)),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.product.name.localeCompare(b.product.name),
    )
    .slice(0, limit)
    .map(({ product }) => {
      const image = primaryCatalogueImage(product.images);
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brandName: product.brandName,
        priceAmount: product.price.amount,
        imageSrc: image?.src ?? null,
        imageAlt: image?.alt ?? "",
      };
    });
}

export function suggestCategories(
  rawQuery: string,
  categories: Category[],
  limit = 3,
): Category[] {
  const query = normalizeSearchText(rawQuery);
  if (query.length < 2) return [];
  return categories
    .filter(
      (category) =>
        normalizeSearchText(category.name).includes(query) ||
        normalizeSearchText(category.group ?? "").includes(query),
    )
    .slice(0, limit);
}
