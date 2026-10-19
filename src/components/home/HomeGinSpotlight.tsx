import { Reveal } from "@/components/motion/Reveal";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PriceTag } from "@/components/ui/PriceTag";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fromPriceForCategory, RANGE_MEDIA } from "@/lib/range-media";

const POINTS = [
  "Organic single-estate gin from France",
  "Presented with its kraft gift box",
  "Add to cart, then confirm on WhatsApp",
];

export function HomeGinSpotlight() {
  const photo = RANGE_MEDIA.gin;
  const fromPrice = fromPriceForCategory("gin");

  return (
    <section className="bg-paper-2 py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <ArchFrame
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 1024px) 90vw, 40vw"
              position="50% 45%"
              className="mx-auto w-full max-w-md shadow-[6px_6px_0_0_var(--brand-charcoal)] lg:max-w-none"
            />
          </Reveal>

          <Reveal delayMs={80}>
            <SectionHeading
              index="03"
              eyebrow="Featured"
              title="Gin, boxed and ready"
              intro="A bottle worth gifting — or keeping. Browse the gin shelf, then send your order on WhatsApp."
            />
            <ul className="mt-8 space-y-3">
              {POINTS.map((point, index) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm sm:text-base"
                >
                  <span className="font-display text-brand-burnt-orange tabular">
                    0{index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/shop?category=gin" variant="primary">
                Shop gin
              </Button>
              {fromPrice ? <PriceTag price={fromPrice} from size="md" /> : null}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
