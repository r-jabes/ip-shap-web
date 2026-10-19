import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/content/PlaceholderPage";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <PlaceholderPage
      title="FAQ"
      intro="Sample questions for layout only. Final FAQ content requires owner confirmation."
      sections={[
        {
          heading: "Can I order online today?",
          body: "Not from this prototype. Cart interactions are demo-only until checkout phases land.",
        },
        {
          heading: "Are the prices real?",
          body: "No. Demo prices are illustrative placeholders for typography and layout review.",
        },
        {
          heading: "Do you deliver outside Kigali?",
          body: "Delivery coverage is to be confirmed. No invented promises are shown in the UI.",
        },
      ]}
    />
  );
}
