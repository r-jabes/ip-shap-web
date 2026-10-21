import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";
import { Button } from "@/components/ui/Button";
import { LEGAL_NAME } from "@/lib/brand";
import { formatPhoneDisplay, SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Privacy policy" };

function questionsBody(): string {
  const parts: string[] = [
    "If you want to know what we hold about an order, contact us with your order reference.",
  ];
  if (SITE.email) parts.push(`Email: ${SITE.email}.`);
  if (SITE.whatsappDigits) {
    parts.push(`WhatsApp: ${formatPhoneDisplay(SITE.whatsappDigits)}.`);
  }
  if (SITE.phoneDigits) {
    parts.push(`Call: ${formatPhoneDisplay(SITE.phoneDigits)}.`);
  }
  return parts.join(" ");
}

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Privacy policy"
      intro={`How ${LEGAL_NAME} handles the details you give us.`}
      variant="legal"
      sections={[
        {
          heading: "What we collect",
          body: "Only what you enter at checkout or send us: your name, phone number, delivery details, order notes and the items you order. We do not invent extra profiles about you.",
        },
        {
          heading: "How we use it",
          body: "To place, confirm and deliver your order and to answer questions about it. Staff may receive an email when a new order is placed. We do not sell your details.",
        },
        {
          heading: "Your cart",
          body: "Your cart is stored in your own browser on your device. Clearing your browser data removes it.",
        },
        {
          heading: "Questions",
          body: questionsBody(),
        },
      ]}
      action={
        <Button href="/contact" variant="ghost">
          Contact us
        </Button>
      }
    />
  );
}
