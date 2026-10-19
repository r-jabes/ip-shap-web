import type { Metadata } from "next";
import { HomeCollections } from "@/components/home/HomeCollections";
import { HomeGinSpotlight } from "@/components/home/HomeGinSpotlight";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeTrustFaq } from "@/components/home/HomeTrustFaq";
import { HomeWhatsAppBand } from "@/components/home/HomeWhatsAppBand";
import { Marquee } from "@/components/ui/Marquee";
import { SHORT_BRAND } from "@/lib/brand";
import { HOME_MARQUEE_RANGES } from "@/lib/range-media";

export const metadata: Metadata = {
  title: {
    absolute: `${SHORT_BRAND} | Wines & spirits in Rwanda`,
  },
  description:
    "Browse whisky, wine, sparkling, vodka and gin from THE IP SHAP BUSINESS LTD. Add bottles to your cart and send your order on WhatsApp.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <div className="border-y border-line bg-brand-warm-white py-4 text-brand-charcoal">
        <Marquee items={[...HOME_MARQUEE_RANGES]} />
      </div>
      <HomeCollections />
      <HomeGinSpotlight />
      <HomeHowItWorks />
      <HomeWhatsAppBand />
      <HomeTrustFaq />
    </>
  );
}
