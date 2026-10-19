import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    title: "Browse",
    body: "Pick bottles from whisky, wine, sparkling, vodka and gin.",
  },
  {
    title: "Add to cart",
    body: "Set quantities and check out with your name and delivery details.",
  },
  {
    title: "Send on WhatsApp",
    body: "We confirm availability, delivery and payment with you directly.",
  },
] as const;

export function HomeHowItWorks() {
  return (
    <section className="border-t border-line py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Ordering"
            title="How ordering works"
            intro="No charge on this site. You send the order; we confirm it with you."
          />
        </Reveal>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal delayMs={index * 70}>
                <p className="font-display text-5xl text-brand-burnt-orange/90 tabular sm:text-6xl">
                  0{index + 1}
                </p>
                <h3 className="font-display mt-4 text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-muted sm:text-base">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
