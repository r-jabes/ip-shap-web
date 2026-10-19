import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <InfoPage
      title={`About ${SHORT_BRAND}`}
      intro={`${LEGAL_NAME} is a drinks retailer based in Rwanda, focused on a tight range of wines and spirits.`}
      sections={[
        {
          heading: "What we sell",
          body: "Whisky, vodka, gin, red wine and sparkling wine, chosen for the bottles people ask for most.",
        },
        {
          heading: "How to order",
          body: "Add your bottles to the cart, check out, and send the order to us on WhatsApp. We confirm availability and delivery with you directly.",
        },
      ]}
    />
  );
}
