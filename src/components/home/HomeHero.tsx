import { BrandAtmosphere } from "@/components/home/BrandAtmosphere";
import { ProductArchStage } from "@/components/home/ProductArchStage";
import { ScrollCue } from "@/components/home/ScrollCue";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { SHORT_BRAND } from "@/lib/brand";
import { RANGE_MEDIA } from "@/lib/range-media";
import { chatHref } from "@/lib/site-config";

export function HomeHero() {
  const photo = RANGE_MEDIA.hero;

  return (
    <section className="relative overflow-hidden bg-brand-warm-white">
      <BrandAtmosphere variant="hero" />
      <Container className="relative flex min-h-[calc(100dvh-var(--header-h)-var(--announcement-h))] flex-col justify-center pt-6 pb-16 sm:pt-8 sm:pb-20 lg:pt-6 lg:pb-20">
        <div className="grid items-center gap-8 lg:items-end lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-10">
          <div className="hero-stagger relative z-20 order-2 max-w-xl lg:order-1 lg:pb-4">
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
              <span className="tabular text-brand-charcoal">01</span>
              <span
                aria-hidden="true"
                className="h-px w-8 bg-brand-charcoal/40"
              />
              Rwanda · wholesale drinks
            </p>
            <h1 className="font-display-hero font-display-hero--home mt-3 text-brand-charcoal">
              {SHORT_BRAND}
            </h1>
            <p className="mt-3 max-w-md text-sm text-ink-muted sm:text-base">
              Wines, spirits, beer and soft drinks at wholesale prices — pick
              what you need and check out on this site.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              <Button href="/shop" variant="primary" size="lg">
                Shop now
              </Button>
              <Button
                href={chatHref("Hello, I would like to ask a question.")}
                variant="secondary"
                size="lg"
                iconLeft={<WhatsAppIcon size={18} />}
              >
                Contact us
              </Button>
              <Button href="/shop" variant="ghost" size="lg">
                View all
              </Button>
            </div>
          </div>

          <div className="relative order-1 z-10 mx-auto w-full max-w-[17rem] sm:max-w-xs lg:order-2 lg:mx-0 lg:max-w-none">
            <ProductArchStage
              photo={photo}
              priority
              sizes="(max-width: 1024px) 70vw, 32rem"
              imageClassName="hero-media"
              className="hero-stage"
            />
          </div>
        </div>
      </Container>
      <ScrollCue href="#home-collections" />
    </section>
  );
}
