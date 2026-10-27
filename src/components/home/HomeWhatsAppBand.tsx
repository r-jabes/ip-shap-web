import { Reveal } from "@/components/motion/Reveal";
import { ArchFrame } from "@/components/ui/ArchFrame";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { RANGE_MEDIA } from "@/lib/range-media";
import { chatHref, SITE } from "@/lib/site-config";

export function HomeWhatsAppBand() {
  const photo = RANGE_MEDIA.contact;

  return (
    <section className="on-ink bg-brand-charcoal py-16 text-brand-warm-white sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <Reveal>
            <ArchFrame
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 1024px) 80vw, 36vw"
              tone="ink"
              position="50% 55%"
              className="mx-auto w-full max-w-xs shadow-[6px_6px_0_0_var(--brand-burnt-orange)] lg:max-w-sm"
            />
          </Reveal>

          <Reveal delayMs={80}>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-brand-burnt-orange uppercase">
              <span className="tabular text-brand-warm-white">05</span>
              <span
                aria-hidden="true"
                className="h-px w-8 bg-current opacity-60"
              />
              Contact us
            </p>
            <h2
              className="font-display mt-3 text-balance"
              style={{ fontSize: "var(--type-h2)" }}
            >
              Questions? Say hello.
            </h2>
            <p className="mt-4 max-w-lg text-brand-warm-white/75">
              Wholesale wines, spirits, beer and soft drinks from {SITE.country}.
              Place your order on this site, visit the shop, or reach out if you
              need a hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/shop" variant="on-dark" size="lg">
                Browse the shop
              </Button>
              <Button
                href={chatHref("Hello — I have a question about IP SHAP.")}
                variant="ghost"
                size="lg"
                className="border-brand-warm-white/40 text-brand-warm-white"
                iconLeft={<WhatsAppIcon size={18} />}
              >
                Contact us
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
