import type { Category, DemoProduct } from "@/domain/catalogue";
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

export function buildNavDataFrom(
  products: DemoProduct[],
  categories: Category[],
): NavData {
  const groups = groupCategories(
    categories,
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

/**
 * Menu data from the slim catalogue index. `promo` is the one full product used for the menu's
 * feature tile; everything else needs only counts.
 */
export function buildNavDataFromIndex(
  index: Array<Pick<DemoProduct, "categorySlug">>,
  categories: Category[],
  promo?: DemoProduct,
): NavData {
  const counts = new Map<string, number>();
  for (const entry of index) {
    if (entry.categorySlug) {
      counts.set(entry.categorySlug, (counts.get(entry.categorySlug) ?? 0) + 1);
    }
  }
  const image = promo ? primaryCatalogueImage(promo.images) : undefined;
  return {
    groups: groupCategories(categories, (slug) => counts.get(slug) ?? 0),
    totalProducts: index.length,
    promo:
      promo && image
        ? {
            eyebrow: "Featured",
            title: promo.name,
            href: `/product/${promo.slug}`,
            imageSrc: image.src,
            imageAlt: image.alt,
            imageWidth: image.width,
            imageHeight: image.height,
          }
        : null,
  };
}

/** Sync demo path — prefer `buildNavDataFrom` with durable data on the storefront. */
export function buildNavData(): NavData {
  return buildNavDataFrom(listProducts(), getCategories());
}
