import type { Metadata } from "next";
import { HomeCollections } from "@/components/home/HomeCollections";
import { HomeFeatured } from "@/components/home/HomeFeatured";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeRangeTicker } from "@/components/home/HomeRangeTicker";
import { HomeTrustFaq } from "@/components/home/HomeTrustFaq";
import { HomeWhatsAppBand } from "@/components/home/HomeWhatsAppBand";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Category } from "@/domain/catalogue";
import { SHORT_BRAND } from "@/lib/brand";
import { getCachedCategories } from "@/lib/catalogue/cache";
import {
  getCategoryCounts,
  getHomeCollectionsDurable,
} from "@/lib/catalogue/storefront";
import {
  getHomeFeaturedSlidesDurable,
  type HomeFeaturedSlide,
} from "@/lib/home-featured";
import { getHomeCollections, type HomeCollectionTile } from "@/lib/range-media";
import { organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = pageMetadata({
  title: "Wholesale drinks in Rwanda",
  absoluteTitle: `${SHORT_BRAND} | Wholesale drinks in Rwanda`,
  description:
    "Wholesale wines, spirits, beer and soft drinks from THE IP SHAP BUSINESS LTD in Rwanda. Competitive prices — add to your cart and check out on this site.",
  path: "/",
});

export const revalidate = 3600;

async function loadHomeCatalogue(): Promise<{
  featured: HomeFeaturedSlide[];
  collections: HomeCollectionTile[];
  categories: Category[];
  counts: Record<string, number>;
}> {
  try {
    const [featured, collections, categories, counts] = await Promise.all([
      getHomeFeaturedSlidesDurable(),
      getHomeCollectionsDurable(),
      getCachedCategories(),
      getCategoryCounts(),
    ]);
    return { featured, collections, categories, counts };
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "home_catalogue_error",
        error: error instanceof Error ? error.message : "unknown",
      }),
    );
    // Always render marketing sections even if Supabase/catalogue fails.
    return {
      featured: [] as HomeFeaturedSlide[],
      collections: getHomeCollections(),
      categories: [] as Category[],
      counts: {} as Record<string, number>,
    };
  }
}

export default async function HomePage() {
  const { featured, collections, categories, counts } =
    await loadHomeCatalogue();

  const tickerItems = categories.map((category, i) => ({
    index: String(i + 1).padStart(2, "0"),
    name: category.name,
    count: counts[category.slug] ?? 0,
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
      <JsonLd data={websiteJsonLd()} />
      <HomeHero />
      <HomeRangeTicker items={tickerItems} />
      <HomeCollections tiles={collections} />
      {featured.length > 0 ? <HomeFeatured slides={featured} /> : null}
      <HomeHowItWorks />
      <HomeWhatsAppBand />
      <HomeTrustFaq />
    </>
  );
}
