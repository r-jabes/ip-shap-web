import type { MoneyRwf } from "@/lib/money";
import { moneyRwf } from "@/lib/money";
import { listProducts, listProductsDurable } from "@/lib/catalogue";

/**
 * One photograph per product range (UI redesign photo allocation).
 * A static layout image must appear at most once per page — these paths are the
 * only sources home / shop should use for range moments.
 */
export const RANGE_MEDIA = {
  whisky: {
    src: "/products/drink-28000-68000-78000.jpeg",
    alt: "Three whisky bottles in a row on a shop shelf",
    width: 810,
    height: 1080,
  },
  wine: {
    src: "/products/drink-13000.jpeg",
    alt: "Red and white wine bottles side by side",
    width: 810,
    height: 1080,
  },
  sparkling: {
    src: "/products/drink-20000.jpeg",
    alt: "Two sparkling wine bottles, rosé and extra-dry",
    width: 810,
    height: 1080,
  },
  vodka: {
    src: "/products/drink-12000.jpeg",
    alt: "Four flavoured vodka bottles in a row",
    width: 810,
    height: 1080,
  },
  gin: {
    src: "/products/drink-60000.jpeg",
    alt: "Gin bottle beside a kraft gift box",
    width: 810,
    height: 1080,
  },
  /** Human-touch photo for the WhatsApp order band (fortified/sacramental wine). */
  order: {
    src: "/products/drink-17000.jpeg",
    alt: "A hand holding a wine bottle",
    width: 810,
    height: 1080,
  },
} as const;

export type RangeSlug = keyof Omit<typeof RANGE_MEDIA, "order">;

/** Lowest published price in a category, or null when the category is empty. */
export function fromPriceForCategory(categorySlug: string): MoneyRwf | null {
  const amounts = listProducts({ categorySlug }).map((p) => p.price.amount);
  if (amounts.length === 0) return null;
  return moneyRwf(Math.min(...amounts));
}

export async function fromPriceForCategoryDurable(
  categorySlug: string,
): Promise<MoneyRwf | null> {
  const amounts = (
    await listProductsDurable({ categorySlug })
  ).map((p) => p.price.amount);
  if (amounts.length === 0) return null;
  return moneyRwf(Math.min(...amounts));
}

export type RangePhoto = (typeof RANGE_MEDIA)[keyof typeof RANGE_MEDIA];

export type HomeCollectionTile = {
  index: string;
  slug: string;
  name: string;
  href: string;
  blurb: string;
  fromPrice: MoneyRwf | null;
  image: RangePhoto;
};

/** Home collections bento: Wine, Sparkling, Vodka (Whisky is the hero; Gin is the spotlight). */
export function getHomeCollections(
  prices?: Partial<Record<"wine" | "sparkling" | "vodka", MoneyRwf | null>>,
): HomeCollectionTile[] {
  return [
    {
      index: "01",
      slug: "wine",
      name: "Wine",
      href: "/shop?category=wine",
      blurb: "Red, white and fortified bottles.",
      fromPrice: prices?.wine ?? fromPriceForCategory("wine"),
      image: RANGE_MEDIA.wine,
    },
    {
      index: "02",
      slug: "sparkling",
      name: "Sparkling",
      href: "/shop?category=sparkling",
      blurb: "Bubbles for celebrations.",
      fromPrice: prices?.sparkling ?? fromPriceForCategory("sparkling"),
      image: RANGE_MEDIA.sparkling,
    },
    {
      index: "03",
      slug: "vodka",
      name: "Vodka",
      href: "/shop?category=vodka",
      blurb: "Classic and flavoured.",
      fromPrice: prices?.vodka ?? fromPriceForCategory("vodka"),
      image: RANGE_MEDIA.vodka,
    },
  ];
}

export async function getHomeCollectionsDurable(): Promise<
  HomeCollectionTile[]
> {
  const [wine, sparkling, vodka] = await Promise.all([
    fromPriceForCategoryDurable("wine"),
    fromPriceForCategoryDurable("sparkling"),
    fromPriceForCategoryDurable("vodka"),
  ]);
  return getHomeCollections({ wine, sparkling, vodka });
}

export const HOME_MARQUEE_RANGES = [
  "Whisky",
  "Wine",
  "Sparkling",
  "Vodka",
  "Gin",
] as const;

/** Every static product photograph the home page is allowed to render (exactly once each). */
export function homePageImageSources(): string[] {
  return [
    RANGE_MEDIA.whisky.src,
    RANGE_MEDIA.wine.src,
    RANGE_MEDIA.sparkling.src,
    RANGE_MEDIA.vodka.src,
    RANGE_MEDIA.gin.src,
    RANGE_MEDIA.order.src,
  ];
}
