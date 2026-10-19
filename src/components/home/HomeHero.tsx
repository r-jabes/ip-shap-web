import { ArchFrame } from "@/components/ui/ArchFrame";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { SHORT_BRAND } from "@/lib/brand";
import { RANGE_MEDIA } from "@/lib/range-media";
import { chatHref } from "@/lib/site-config";

export function HomeHero() {
  const photo = RANGE_MEDIA.whisky;

  return (
    <section className="relative overflow-hidden bg-brand-warm-white pt-6 pb-10 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20">
      <Container className="relative">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-0">
          <div className="hero-stagger relative z-20 order-2 max-w-xl lg:order-1 lg:-mr-24 lg:pb-8 xl:-mr-32">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
              <span className="tabular text-brand-charcoal">01</span>
              <span
                aria-hidden="true"
                className="h-px w-8 bg-current opacity-60"
              />
              Rwanda · wines &amp; spirits
            </p>
            <h1 className="font-display-hero mt-5 text-brand-charcoal">
              {SHORT_BRAND}
            </h1>
            <p className="mt-5 max-w-md text-base text-ink-muted sm:text-lg">
              Whisky, wine and more — pick your bottles, then send the order on
              WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/shop" variant="primary" size="lg">
                Shop now
              </Button>
              <Button
                href={chatHref()}
                variant="secondary"
                size="lg"
                iconLeft={<WhatsAppIcon size={18} />}
              >
                Order on WhatsApp
              </Button>
            </div>
            <p className="mt-10 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">
              <span
                aria-hidden="true"
                className="inline-block h-8 w-px bg-brand-charcoal/30"
              />
              Scroll
            </p>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:mx-0 lg:max-w-none">
            {/* Orange accent — one decorative shape, behind the arch. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-4 -right-2 h-24 w-24 rotate-12 rounded-[1.75rem] bg-brand-burnt-orange sm:-top-6 sm:-right-4 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 -left-3 h-16 w-16 rounded-full bg-brand-charcoal/10 sm:h-20 sm:w-20"
            />
            <ArchFrame
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 1024px) 90vw, 42vw"
              priority
              position="50% 40%"
              className="relative z-[1] w-full shadow-[8px_8px_0_0_var(--brand-charcoal)]"
              imageClassName="hero-media"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
