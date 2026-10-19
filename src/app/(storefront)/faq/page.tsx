import type { Metadata } from "next";
import { InfoPage } from "@/components/content/InfoPage";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <InfoPage
      title="FAQ"
      intro="Quick answers about ordering."
      sections={[
        {
          heading: "How do I order?",
          body: "Add bottles to your cart, check out, and send the order to us on WhatsApp. We confirm it with you.",
        },
        {
          heading: "When do I pay?",
          body: "We agree payment with you when we confirm the order. You are not charged on the website.",
        },
        {
          heading: "Do you deliver outside Kigali?",
          body: "Ask us. We confirm coverage, fee and timing for your area when you order.",
        },
        {
          heading: "Who can order?",
          body: "You must be of legal drinking age to order alcohol.",
        },
      ]}
    />
  );
}
