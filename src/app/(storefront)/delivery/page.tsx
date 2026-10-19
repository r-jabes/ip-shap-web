import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = { title: "Delivery" };

export default function DeliveryPage() {
  return (
    <InfoPage
      title="Delivery"
      intro="We serve customers within Rwanda. Delivery details are agreed with you when you place an order."
      sections={[
        {
          heading: "Fees and timing",
          body: "The delivery fee and the expected time depend on where you are. We confirm both with you on WhatsApp before the order is final.",
        },
        {
          heading: "Before you order",
          body: "Not sure whether we reach your area? Send us a message and we will tell you.",
        },
      ]}
    />
  );
}
