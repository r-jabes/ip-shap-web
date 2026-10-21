import type { DemoProduct } from "@/domain/catalogue";
import { getFeaturedProductsDurable } from "@/lib/catalogue";
import type { MoneyRwf } from "@/lib/money";
import { primaryCatalogueImage } from "@/lib/product-image";
import {
  fromPriceForCategory,
  fromPriceForCategoryDurable,
  RANGE_MEDIA,
  type RangePhoto,
} from "@/lib/range-media";

/** Featured stage accepts demo range assets or durable catalogue URLs. */
export type FeaturedPhoto = RangePhoto | {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Home "Featured" slides. Built from published featured products when present;
 * otherwise category marketing slides (prices from live catalogue).
 */
export type HomeFeaturedSlide = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  ctaLabel: string;
  href: string;
  secondaryCtaLabel: string;
  secondaryHref: string;
  fromPrice: MoneyRwf | null;
  image: FeaturedPhoto;
  /** CSS object-position for the arch crop. */
  imagePosition: string;
};

export const FEATURED_INTERVAL_MS = 5000;

function productToSlide(product: DemoProduct, index: number): HomeFeaturedSlide {
  const image = primaryCatalogueImage(product.images);
  const photo: FeaturedPhoto = image
    ? {
        src: image.src,
        alt: image.alt || product.name,
        width: image.width,
        height: image.height,
      }
    : RANGE_MEDIA.whisky;

  return {
    id: product.id,
    eyebrow: index === 0 ? "Featured" : "On the shelf",
    title: product.name,
    intro: product.description.slice(0, 160) || `Browse ${product.name} and check out on this site.`,
    points: [
      product.brandName ? `From ${product.brandName}` : "From our shelf",
      "Add to cart on this site",
      "We confirm availability with you",
    ],
    ctaLabel: "View bottle",
    href: `/product/${product.slug}`,
    secondaryCtaLabel: "Shop all",
    secondaryHref: "/shop",
    fromPrice: product.price,
    image: photo,
    imagePosition: "50% 45%",
  };
}

/** Sync category fallback (demo / empty featured set). */
export function getHomeFeaturedSlides(): HomeFeaturedSlide[] {
  return [
    {
      id: "gin",
      eyebrow: "Featured",
      title: "Gin, boxed and ready",
      intro:
        "A bottle worth gifting — or keeping. Browse the gin shelf, then check out on this site.",
      points: [
        "Organic single-estate gin from France",
        "Presented with its kraft gift box",
        "Add to cart, then check out here",
      ],
      ctaLabel: "Shop gin",
      href: "/shop?category=gin",
      secondaryCtaLabel: "View all drinks",
      secondaryHref: "/shop",
      fromPrice: fromPriceForCategory("gin"),
      image: RANGE_MEDIA.gin,
      imagePosition: "50% 45%",
    },
    {
      id: "whisky",
      eyebrow: "Spotlight",
      title: "Whisky on the shelf",
      intro:
        "Blended Scotch and more — start with whisky, then check out on this site.",
      points: [
        "Browse labels and compare bottles",
        "Add what you want to the cart",
        "We confirm availability with you",
      ],
      ctaLabel: "Shop whisky",
      href: "/shop?category=whisky",
      secondaryCtaLabel: "View all drinks",
      secondaryHref: "/shop",
      fromPrice: fromPriceForCategory("whisky"),
      image: RANGE_MEDIA.whisky,
      imagePosition: "50% 60%",
    },
    {
      id: "sparkling",
      eyebrow: "For celebrations",
      title: "Sparkling for the table",
      intro:
        "Rosé and extra-dry bottles for gatherings. Add them to your cart and we confirm with you.",
      points: [
        "Rosé and extra-dry styles",
        "Prices in Rwandan francs (RWF)",
        "Order confirmed with you",
      ],
      ctaLabel: "Shop sparkling",
      href: "/shop?category=sparkling",
      secondaryCtaLabel: "View all drinks",
      secondaryHref: "/shop",
      fromPrice: fromPriceForCategory("sparkling"),
      image: RANGE_MEDIA.sparkling,
      imagePosition: "50% 40%",
    },
    {
      id: "wine",
      eyebrow: "On the shelf",
      title: "Red and white, ready to pour",
      intro:
        "Pick a bottle for dinner or a gift. Check out on this site — we confirm with you.",
      points: [
        "Red, white and fortified wines",
        "Quantities set in the cart",
        "We agree delivery with you",
      ],
      ctaLabel: "Shop wine",
      href: "/shop?category=wine",
      secondaryCtaLabel: "View all drinks",
      secondaryHref: "/shop",
      fromPrice: fromPriceForCategory("wine"),
      image: RANGE_MEDIA.wine,
      imagePosition: "50% 40%",
    },
  ];
}

export async function getHomeFeaturedSlidesDurable(): Promise<
  HomeFeaturedSlide[]
> {
  const featured = await getFeaturedProductsDurable(4);
  if (featured.length > 0) {
    return featured.map(productToSlide);
  }

  const [gin, whisky, sparkling, wine] = await Promise.all([
    fromPriceForCategoryDurable("gin"),
    fromPriceForCategoryDurable("whisky"),
    fromPriceForCategoryDurable("sparkling"),
    fromPriceForCategoryDurable("wine"),
  ]);

  const slides = getHomeFeaturedSlides();
  return slides.map((slide) => {
    if (slide.id === "gin") return { ...slide, fromPrice: gin };
    if (slide.id === "whisky") return { ...slide, fromPrice: whisky };
    if (slide.id === "sparkling") return { ...slide, fromPrice: sparkling };
    if (slide.id === "wine") return { ...slide, fromPrice: wine };
    return slide;
  });
}
