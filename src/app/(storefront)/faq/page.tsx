import type { Metadata } from "next";
import { FaqList } from "@/components/content/FaqList";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { chatHref } from "@/lib/site-config";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  {
    question: "How do I order?",
    answer:
      "Add bottles to your cart, check out, and send the order to us on WhatsApp. We confirm it with you before anything is final.",
  },
  {
    question: "When do I pay?",
    answer:
      "We agree payment with you when we confirm the order. You are not charged on the website.",
  },
  {
    question: "Do you deliver outside Kigali?",
    answer:
      "Ask us. We confirm coverage, fee and timing for your area when you order.",
  },
  {
    question: "Who can order?",
    answer:
      "You must be of legal drinking age to order alcohol. We may ask for proof of age at delivery.",
  },
  {
    question: "Can I change or cancel an order?",
    answer:
      "Message us with your order reference as soon as you can. Once we have confirmed and started preparing, changes may not be possible.",
  },
];

export default function FaqPage() {
  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Help
        </p>
        <h1
          className="font-display mt-3 text-brand-charcoal"
          style={{ fontSize: "var(--type-display)" }}
        >
          FAQ
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-muted">
          Quick answers about ordering with us. Still stuck? Message us.
        </p>
      </div>

      <div className="mt-10 max-w-3xl">
        <FaqList items={FAQS} />
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button
          href={chatHref("Hello — I have a question about ordering.")}
          size="lg"
          iconLeft={<WhatsAppIcon size={18} />}
        >
          Ask a question
        </Button>
        <Button href="/contact" variant="ghost" size="lg">
          Contact page
        </Button>
      </div>
    </Container>
  );
}
