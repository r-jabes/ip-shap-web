import type { Metadata } from "next";
import { HomeCollections } from "@/components/home/HomeCollections";
import { HomeFeatured } from "@/components/home/HomeFeatured";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeRangeTicker } from "@/components/home/HomeRangeTicker";
import { HomeTrustFaq } from "@/components/home/HomeTrustFaq";
import { HomeWhatsAppBand } from "@/components/home/HomeWhatsAppBand";
import { SHORT_BRAND } from "@/lib/brand";
import { getHomeFeaturedSlides } from "@/lib/home-featured";

export const metadata: Metadata = {
  title: {
    absolute: `${SHORT_BRAND} | Wines & spirits in Rwanda`,
  },
  description:
    "Browse whisky, wine, sparkling, vodka and gin from THE IP SHAP BUSINESS LTD. Add bottles to your cart and send your order on WhatsApp.",
};

export default function HomePage() {
  const featured = getHomeFeaturedSlides();

  return (
    <>
      <HomeHero />
      <HomeRangeTicker />
      <HomeCollections />
      <HomeFeatured slides={featured} />
      <HomeHowItWorks />
      <HomeWhatsAppBand />
      <HomeTrustFaq />
    </>
  );
}
