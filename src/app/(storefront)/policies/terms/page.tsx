import { InfoPage } from "@/components/content/InfoPage";
import { Button } from "@/components/ui/Button";
import { LEGAL_NAME } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Terms of sale",
  description: `Terms for ordering wholesale drinks from ${LEGAL_NAME}. Orders are confirmed with you before payment; legal drinking age applies.`,
  path: "/policies/terms",
});

export default function TermsPage() {
  const hoursNote = SITE.hours
    ? ` Usual opening hours: ${SITE.hours} (Africa/Kigali).`
    : "";

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
          body: `An order is created when you complete checkout on this site. It becomes final once we have confirmed it with you. Availability, delivery fee and timing are agreed at confirmation.${hoursNote}`,
        },
        {
          heading: "Prices",
          body: "Prices are in Rwandan francs (RWF). We may correct a price that was shown by mistake and will tell you before confirming.",
        },
        {
          heading: "Payment",
          body: "You are not charged on this website for the usual order path. Payment is agreed when we confirm the order with you. Opening WhatsApp or visiting a page is never proof of payment.",
        },
        {
          heading: "Contact",
          body: "Questions about an order should go through the Contact page channels we publish (WhatsApp, call or email). We only use details the business has confirmed.",
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
