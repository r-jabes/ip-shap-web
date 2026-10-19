import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/content/PlaceholderPage";
import { SHORT_BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PlaceholderPage
      title={`About ${SHORT_BRAND}`}
      intro="THE IP SHAP BUSINESS LTD is a single-retailer drinks business preparing an online storefront for Rwanda. Brand story copy below is a placeholder for owner confirmation."
      sections={[
        {
          heading: "What this prototype is",
          body: "A client-facing visual direction for shopping UX — not a live ordering system. Demo products use temporary names and placeholder imagery.",
        },
        {
          heading: "What comes next",
          body: "After visual approval: client product photography, confirmed prices, motion polish, inventory admin, checkout, payments and delivery configuration.",
        },
      ]}
    />
  );
}
