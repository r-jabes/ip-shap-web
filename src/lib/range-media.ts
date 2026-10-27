import type { MoneyRwf } from "@/lib/money";
import { moneyRwf } from "@/lib/money";
import { listProducts } from "@/lib/catalogue";
import { buildShopHref } from "@/lib/shop-query";

/**
 * Home-page photographs (public/home). A static layout image must appear at most once
 * per page — these paths are the only sources the home page should use.
 */
export const RANGE_MEDIA = {
  /** Hero arch: wine and spirits on a bar top. */
  hero: {
    src: "/home/hero.webp",
    alt: "Red wine, white wine, whisky and cognac bottles on a bar top",
    width: 900,
    height: 1200,
  },
  winesSpirits: {
    src: "/home/range-wines-spirits.webp",
    alt: "A crate of wine bottles with spirits on the shelves behind",
    width: 900,
    height: 1200,
  },
  beer: {
    src: "/home/range-beer.webp",
    alt: "Beer bottles and cans chilling in an ice bucket",
    width: 900,
    height: 1200,
  },
  softDrinks: {
    src: "/home/range-soft-drinks.webp",
    alt: "Cola, orange and lemon-lime soft drinks in bottles and cans",
    width: 900,
    height: 1200,
  },
  /** Contact band: the shop itself. */
  contact: {
    src: "/home/contact.webp",
    alt: "Shelves of wine and spirits, crates of beer and a soft-drinks fridge behind a shop counter",
    width: 900,
    height: 1200,
  },
} as const;

export type RangePhoto = (typeof RANGE_MEDIA)[keyof typeof RANGE_MEDIA];

/** Lowest published price across a set of categories, or null when they are all empty. */
export function fromPriceForCategories(
  categorySlugs: readonly string[],
): MoneyRwf | null {
  const amounts = listProducts({ categorySlugs: [...categorySlugs] }).map(
    (p) => p.price.amount,
  );
  if (amounts.length === 0) return null;
  return moneyRwf(Math.min(...amounts));
}

export type HomeRangeGroupSlug = "wines-spirits" | "beer" | "soft-drinks";

/** The three major groups the business sells. Each one spans one or more catalogue categories. */
export const HOME_RANGE_GROUPS: ReadonlyArray<{
  slug: HomeRangeGroupSlug;
  name: string;
  blurb: string;
  categorySlugs: readonly string[];
  image: RangePhoto;
  /** CSS object-position inside the tile. */
  position: string;
}> = [
  {
    slug: "wines-spirits",
    name: "Wines & Spirits",
    blurb: "Wine, whisky, vodka, gin, cognac and more.",
    categorySlugs: [
      "wine",
      "red-wine",
      "white-wine",
      "rose-wine",
      "sparkling",
      "sparkling-wine",
      "whisky",
      "vodka",
      "gin",
      "rum",
      "brandy-cognac",
      "tequila",
      "liqueurs",
    ],
    image: RANGE_MEDIA.winesSpirits,
    position: "50% 50%",
  },
  {
    slug: "beer",
    name: "Beer",
    blurb: "Local and imported lagers, by the bottle or crate.",
    categorySlugs: ["beer-cider"],
    image: RANGE_MEDIA.beer,
    position: "50% 62%",
  },
  {
    slug: "soft-drinks",
    name: "Soft drinks",
    blurb: "Fanta, Coca-Cola, Sprite, water and more.",
    categorySlugs: ["soft-drinks"],
    image: RANGE_MEDIA.softDrinks,
    position: "50% 58%",
  },
];

export type HomeCollectionTile = {
  index: string;
  slug: HomeRangeGroupSlug;
  name: string;
  href: string;
  blurb: string;
  fromPrice: MoneyRwf | null;
  image: RangePhoto;
  position: string;
};

/**
 * Home "Shop by range" tiles. `prices` (from the live catalogue) and `existingCategories`
 * (slugs that really exist in the database) are optional; without them the demo catalogue
 * and the full static slug lists are used.
 */
export function getHomeCollections(options?: {
  prices?: Partial<Record<HomeRangeGroupSlug, MoneyRwf | null>>;
  existingCategories?: ReadonlySet<string>;
}): HomeCollectionTile[] {
  return HOME_RANGE_GROUPS.map((group, i) => {
    const existing = options?.existingCategories;
    const known = existing
      ? group.categorySlugs.filter((slug) => existing.has(slug))
      : [];
    // Only link categories that exist; if none do, keep the full list so the link still works.
    const slugs = known.length ? known : [...group.categorySlugs];
    return {
      index: String(i + 1).padStart(2, "0"),
      slug: group.slug,
      name: group.name,
      href: buildShopHref({ categories: slugs }),
      blurb: group.blurb,
      fromPrice: options?.prices
        ? (options.prices[group.slug] ?? null)
        : fromPriceForCategories(slugs),
      image: group.image,
      position: group.position,
    };
  });
}

/** Every static photograph the home page is allowed to render (exactly once each). */
export function homePageImageSources(): string[] {
  return [
    RANGE_MEDIA.hero.src,
    RANGE_MEDIA.winesSpirits.src,
    RANGE_MEDIA.beer.src,
    RANGE_MEDIA.softDrinks.src,
    RANGE_MEDIA.contact.src,
  ];
}
