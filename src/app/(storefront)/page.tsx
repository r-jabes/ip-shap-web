import type { Metadata } from "next";
import { HomeCollections } from "@/components/home/HomeCollections";
import { HomeFeatured } from "@/components/home/HomeFeatured";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeRangeTicker } from "@/components/home/HomeRangeTicker";
import { HomeTrustFaq } from "@/components/home/HomeTrustFaq";
import { HomeWhatsAppBand } from "@/components/home/HomeWhatsAppBand";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Category, DemoProduct } from "@/domain/catalogue";
import { SHORT_BRAND } from "@/lib/brand";
import {
  getCachedCategories,
  getCachedPublishedProducts,
} from "@/lib/catalogue/cache";
import {
  getHomeFeaturedSlides,
  getHomeFeaturedSlidesDurable,
  type HomeFeaturedSlide,
} from "@/lib/home-featured";
import {
  getHomeCollections,
  getHomeCollectionsDurable,
  type HomeCollectionTile,
} from "@/lib/range-media";
import { organizationJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    absolute: `${SHORT_BRAND} | Wines & spirits in Rwanda`,
  },
  description:
    "Browse whisky, wine, sparkling, vodka and gin from THE IP SHAP BUSINESS LTD. Add bottles to your cart and check out on this site.",
};

export const revalidate = 3600;

async function loadHomeCatalogue(): Promise<{
  featured: HomeFeaturedSlide[];
  collections: HomeCollectionTile[];
  categories: Category[];
  products: DemoProduct[];
}> {
  try {
    const [featured, collections, categories, products] = await Promise.all([
      getHomeFeaturedSlidesDurable(),
      getHomeCollectionsDurable(),
      getCachedCategories(),
      getCachedPublishedProducts(),
    ]);
    return { featured, collections, categories, products };
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "home_catalogue_error",
        error: error instanceof Error ? error.message : "unknown",
      }),
    );
    // Always render marketing sections even if Supabase/catalogue fails.
    return {
      featured: getHomeFeaturedSlides(),
      collections: getHomeCollections(),
      categories: [] as Category[],
      products: [] as DemoProduct[],
    };
  }
}

export default async function HomePage() {
  const { featured, collections, categories, products } =
    await loadHomeCatalogue();

  const tickerItems = categories.map((category, i) => ({
    index: String(i + 1).padStart(2, "0"),
    name: category.name,
    count: products.filter((product) => product.categorySlug === category.slug)
      .length,
    href: `/shop?category=${category.slug}`,
  }));

  return (
    <>
      <JsonLd
        data={organizationJsonLd({
          telephone: SITE.phoneDigits,
          email: SITE.email,
          address: SITE.address,
        })}
      />
      <HomeHero />
      <HomeRangeTicker items={tickerItems} />
      <HomeCollections tiles={collections} />
      <HomeFeatured slides={featured} />
      <HomeHowItWorks />
      <HomeWhatsAppBand />
      <HomeTrustFaq />
    </>
  );
}
