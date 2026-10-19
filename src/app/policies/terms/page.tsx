import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/content/PlaceholderPage";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="Terms of sale"
      intro="Placeholder terms page for navigation completeness. Final wording needs business and legal review."
      sections={[
        {
          heading: "Status",
          body: "Age restrictions, returns, refunds and alcohol sale rules must be confirmed with qualified local advice before launch.",
        },
      ]}
    />
  );
}
