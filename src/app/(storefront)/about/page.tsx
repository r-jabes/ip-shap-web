import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { Button } from "@/components/ui/Button";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Our story"
      title={`About ${SHORT_BRAND}`}
      intro={`${LEGAL_NAME} is a drinks retailer based in ${SITE.country}, focused on a tight range of wines and spirits people actually ask for.`}
      sections={[
        {
          index: "01",
          heading: "What we sell",
          body: "Whisky, vodka, gin, red wine and sparkling wine — a focused selection rather than an endless aisle.",
        },
        {
          index: "02",
          heading: "How to order",
          body: "Add bottles to your cart, check out, and send the order on WhatsApp. We confirm availability and delivery with you directly.",
        },
        {
          index: "03",
          heading: "Based in Rwanda",
          body: "We work with customers across the country. Coverage, fee and timing are agreed when you place the order — never invented on the page.",
        },
        {
          index: "04",
          heading: "Straight answers",
          body: "Availability, delivery fee and payment are confirmed with you — not guessed ahead of time on the page.",
        },
      ]}
      action={
        <div className="flex flex-wrap gap-3">
          <Button href="/shop" size="lg">
            Browse the shop
          </Button>
          <Button href="/contact" variant="ghost" size="lg">
            Contact us
          </Button>
        </div>
      }
    />
  );
}
