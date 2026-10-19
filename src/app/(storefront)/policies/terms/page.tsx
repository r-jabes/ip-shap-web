import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { Button } from "@/components/ui/Button";
import { LEGAL_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms of sale" };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Terms of sale"
      intro={`These terms apply to orders placed with ${LEGAL_NAME} through this website.`}
      variant="legal"
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
        {
          heading: "Payment",
          body: "You are not charged on this website. Payment is agreed when we confirm the order with you.",
        },
      ]}
      action={
        <Button href="/shop" variant="ghost">
          Browse the shop
        </Button>
      }
    />
  );
}
