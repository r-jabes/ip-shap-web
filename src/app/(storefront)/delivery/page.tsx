import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/content/PlaceholderPage";

export const metadata: Metadata = { title: "Delivery" };

export default function DeliveryPage() {
  return (
    <PlaceholderPage
      title="Delivery"
      intro="Delivery is intended within Rwanda. Zones, fees, cut-off times and estimates are unknown until THE IP SHAP BUSINESS LTD confirms them."
      sections={[
        {
          heading: "Current status",
          body: "Unavailable / unknown in this prototype. The storefront will show an explicit unknown state rather than inventing fees or timelines.",
        },
        {
          heading: "What we need from Rosine",
          body: "Coverage areas, fees per zone, any free-delivery thresholds, operating hours, and rules for alcohol delivery if applicable.",
        },
      ]}
    />
  );
}
