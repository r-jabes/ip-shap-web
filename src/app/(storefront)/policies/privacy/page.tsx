import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { LEGAL_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy policy"
      intro={`How ${LEGAL_NAME} handles the details you give us.`}
      sections={[
        {
          heading: "What we collect",
          body: "Only what you enter at checkout: your name, phone number, delivery details and the items you order.",
        },
        {
          heading: "How we use it",
          body: "To confirm and deliver your order and to answer questions about it. We do not sell your details.",
        },
        {
          heading: "Your cart",
          body: "Your cart is stored in your own browser on your device. Clearing your browser data removes it.",
        },
      ]}
    />
  );
}
