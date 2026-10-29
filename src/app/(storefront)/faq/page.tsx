import { FaqList } from "@/components/content/FaqList";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { faqPageJsonLd, pageMetadata } from "@/lib/seo";
import { chatHref } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers about ordering wholesale drinks from IP SHAP: how to order, payment, delivery in Rwanda, age limits and changing an order.",
  path: "/faq",
});

const FAQS = [
  {
    question: "How do I order?",
    answer:
      "Add bottles to your cart and check out on this site. We confirm the order with you before anything is final. WhatsApp is for Contact us if you have a question.",
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
    <>
      <JsonLd data={faqPageJsonLd(FAQS)} />
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
          <Reveal>
            <FaqList items={FAQS} />
          </Reveal>
        </div>

        <div className="mt-12">
          <Button
            href={chatHref("Hello — I have a question.")}
            variant="secondary"
            size="lg"
            iconLeft={<WhatsAppIcon size={18} />}
          >
            Contact us
          </Button>
        </div>
      </Container>
    </>
  );
}
