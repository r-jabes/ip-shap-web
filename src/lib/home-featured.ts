import type { MoneyRwf } from "@/lib/money";
import {
  fromPriceForCategory,
  RANGE_MEDIA,
  type RangePhoto,
} from "@/lib/range-media";

/**
 * Home "Featured" slides. A static fixture for now; the admin will later supply
 * the same shape (title, copy, link, price, photo) from the database, so the
 * UI reads only from this type. Photos here may repeat other home photos until
 * the admin uploads dedicated ones.
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
  image: RangePhoto;
  /** CSS object-position for the arch crop. */
  imagePosition: string;
};

export const FEATURED_INTERVAL_MS = 5000;

export function getHomeFeaturedSlides(): HomeFeaturedSlide[] {
  return [
    {
      id: "gin",
      eyebrow: "Featured",
      title: "Gin, boxed and ready",
      intro:
        "A bottle worth gifting — or keeping. Browse the gin shelf, then send your order on WhatsApp.",
      points: [
        "Organic single-estate gin from France",
        "Presented with its kraft gift box",
        "Add to cart, then confirm on WhatsApp",
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
        "Blended Scotch and more — start with whisky, then send your order on WhatsApp.",
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
        "Order confirmed on WhatsApp",
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
        "Pick a bottle for dinner or a gift. Check out, then send the order on WhatsApp.",
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
