import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/content/PlaceholderPage";
import {
  ADDRESS_PLACEHOLDER,
  EMAIL_PLACEHOLDER,
  WHATSAPP_PLACEHOLDER,
} from "@/lib/brand";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact"
      intro="All contact details on this page are placeholders. Replace with confirmed business channels before launch."
      sections={[
        {
          heading: "WhatsApp (placeholder)",
          body: WHATSAPP_PLACEHOLDER,
        },
        {
          heading: "Email (placeholder)",
          body: EMAIL_PLACEHOLDER,
        },
        {
          heading: "Location (placeholder)",
          body: ADDRESS_PLACEHOLDER,
        },
      ]}
    />
  );
}
