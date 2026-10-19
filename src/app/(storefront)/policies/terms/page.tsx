import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { LEGAL_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms of sale" };

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of sale"
      intro={`These terms apply to orders placed with ${LEGAL_NAME} through this website.`}
      sections={[
        {
          heading: "Age",
          body: "Alcohol is sold only to people of legal drinking age. We may ask for proof of age at delivery and may cancel an order if it cannot be shown.",
        },
        {
          heading: "Orders",
          body: "An order is final once we have confirmed it with you. Availability, delivery fee and timing are agreed at confirmation.",
        },
        {
          heading: "Prices",
          body: "Prices are in Rwandan francs (RWF). We may correct a price that was shown by mistake and will tell you before confirming.",
        },
      ]}
    />
  );
}
