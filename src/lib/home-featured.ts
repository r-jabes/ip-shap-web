import type { DemoProduct } from "@/domain/catalogue";
import { getFeaturedProductsDurable } from "@/lib/catalogue";
import type { MoneyRwf } from "@/lib/money";
import { primaryCatalogueImage } from "@/lib/product-image";
import { RANGE_MEDIA, type RangePhoto } from "@/lib/range-media";

/** Featured stage accepts demo range assets or durable catalogue URLs. */
export type FeaturedPhoto = RangePhoto | {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Home "Featured" slides. Built only from products an admin has chosen to feature on the
 * Featured page. When nothing is featured the home page leaves the section out.
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
    : RANGE_MEDIA.hero;

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

/** Slides for the products the admin has featured, in their chosen order. Empty when none. */
export async function getHomeFeaturedSlidesDurable(): Promise<
  HomeFeaturedSlide[]
> {
  const featured = await getFeaturedProductsDurable(4);
  return featured.map(productToSlide);
}
