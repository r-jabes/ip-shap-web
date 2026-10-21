import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE } from "@/lib/site-config";

const TRUST = [
  `Based in ${SITE.country}`,
  "Order confirmed with you",
  "Prices in Rwandan francs (RWF)",
  "Legal drinking age required",
] as const;

const FAQ_TEASERS = [
  {
    q: "How do I order?",
    a: "Add bottles to your cart, check out on this site, and we confirm with you.",
  },
  {
    q: "When do I pay?",
    a: "We agree payment with you when we confirm the order.",
  },
  {
    q: "Do you deliver outside Kigali?",
    a: "Ask us — we confirm coverage and fee for your area when you order.",
  },
] as const;

export function HomeTrustFaq() {
  return (
    <section className="border-t border-line py-16 sm:py-20">
      <Container>
        <Reveal>
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold tracking-[0.04em] text-ink-muted uppercase">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rotate-45 bg-brand-burnt-orange"
                />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-16">
          <Reveal>
            <SectionHeading
              index="06"
              eyebrow="FAQ"
              title="Quick answers"
              action={
                <Button href="/faq" variant="ghost" size="sm">
                  All questions
                </Button>
              }
            />
          </Reveal>

          <ul className="mt-8 divide-y divide-line border-y border-line">
            {FAQ_TEASERS.map((item, index) => (
              <li key={item.q}>
                <Reveal delayMs={index * 50}>
                  <Link
                    href="/faq"
                    className="group flex flex-col gap-2 py-5 transition-colors duration-[var(--motion-ui)] hover:bg-paper-2/60 sm:flex-row sm:items-baseline sm:gap-8 sm:px-2"
                  >
                    <span className="font-display shrink-0 text-lg sm:w-56 sm:text-xl">
                      {item.q}
                    </span>
                    <span className="text-sm text-ink-muted sm:text-base">
                      {item.a}
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
