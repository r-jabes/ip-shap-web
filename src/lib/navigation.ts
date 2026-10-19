import type { Category } from "@/domain/catalogue";
import { getCategories, listProducts } from "@/lib/catalogue";
import { primaryCatalogueImage } from "@/lib/product-image";

/**
 * Serialisable navigation model derived from the catalogue, so the mega menu grows with the data
 * (new categories and counts appear without touching the header component).
 */
export type NavCategory = {
  slug: string;
  name: string;
  description: string;
  count: number;
};

export type NavGroup = {
  title: string;
  categories: NavCategory[];
};

export type NavPromo = {
  eyebrow: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

export type NavData = {
  groups: NavGroup[];
  promo: NavPromo | null;
  totalProducts: number;
};

export function groupCategories(
  categories: Category[],
  countFor: (slug: string) => number,
): NavGroup[] {
  const groups = new Map<string, NavCategory[]>();
  for (const category of categories) {
    const title = category.group ?? "More";
    const list = groups.get(title) ?? [];
    list.push({
      slug: category.slug,
      name: category.name,
      description: category.description,
      count: countFor(category.slug),
    });
    groups.set(title, list);
  }
  return Array.from(groups, ([title, list]) => ({
    title,
    categories: list.filter((entry) => entry.count > 0),
  })).filter((group) => group.categories.length > 0);
}

export function buildNavData(): NavData {
  const products = listProducts();
  const groups = groupCategories(
    getCategories(),
    (slug) =>
      products.filter((product) => product.categorySlug === slug).length,
  );

  // Menu feature tile: first gin product when available, else the first product.
  const featured =
    products.find((product) => product.categorySlug === "gin") ?? products[0];
  const image = featured ? primaryCatalogueImage(featured.images) : undefined;

  return {
    groups,
    totalProducts: products.length,
    promo:
      featured && image
        ? {
            eyebrow: "Featured",
            title: featured.name,
            href: `/product/${featured.slug}`,
            imageSrc: image.src,
            imageAlt: image.alt,
            imageWidth: image.width,
            imageHeight: image.height,
          }
        : null,
  };
}
