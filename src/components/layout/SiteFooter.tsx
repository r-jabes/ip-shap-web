import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import {
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { DEVELOPER } from "@/lib/brand";
import type { NavData } from "@/lib/navigation";
import { SITE, chatHref, formatPhoneDisplay } from "@/lib/site-config";

const helpLinks = [
  { href: "/delivery", label: "Delivery" },
  { href: "/faq", label: "FAQ" },
  { href: "/order/lookup", label: "Find your order" },
  { href: "/saved", label: "Saved drinks" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
];

const headingClass =
  "text-xs font-semibold tracking-[0.18em] text-brand-burnt-orange uppercase";
const linkClass =
  "inline-flex min-h-9 items-center text-[0.95rem] text-brand-warm-white/80 underline-offset-4 transition-colors duration-[var(--motion-fast)] hover:text-brand-warm-white hover:underline";

export function SiteFooter({ nav }: { nav: NavData }) {
  const categories = nav.groups.flatMap((group) => group.categories);
  const hasContact =
    SITE.whatsappDigits || SITE.phoneDigits || SITE.email || SITE.address;

  return (
    <footer className="on-ink relative mt-auto overflow-hidden bg-brand-charcoal text-brand-warm-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-brand-warm-white/12 py-14 md:flex-row md:items-end md:justify-between">
          <h2
            className="font-display max-w-2xl text-balance"
            style={{ fontSize: "var(--type-display)" }}
          >
            Ready to order?{" "}
            <span className="text-brand-burnt-orange">Say hello.</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              href={chatHref("Hello, I would like to ask a question.")}
              variant="primary"
              iconLeft={<WhatsAppIcon size={18} />}
            >
              Contact us
            </Button>
            <Button href="/shop" variant="on-dark">
              Browse the shop
            </Button>
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <BrandLogo tone="on-ink" height={48} />
            <p className="mt-5 max-w-xs text-[0.95rem] text-brand-warm-white/70">
              Wholesale wines, spirits, beer and soft drinks from {SITE.country}.
              Browse online, check out on this site, then contact us if you need
              help.
            </p>
          </div>

          <nav aria-label="Shop categories">
            <h2 className={headingClass}>Shop</h2>
            <ul className="mt-3">
              <li>
                <Link href="/shop" className={linkClass}>
                  All drinks
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className={linkClass}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <h2 className={headingClass}>Help</h2>
            <ul className="mt-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={headingClass}>Get in touch</h2>
            {hasContact ? (
              <ul className="mt-3 space-y-2 text-[0.95rem] text-brand-warm-white/80">
                {SITE.whatsappDigits ? (
                  <li className="flex items-center gap-2.5">
                    <WhatsAppIcon size={17} />
                    <a
                      className="underline-offset-4 hover:underline"
                      href={chatHref()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatPhoneDisplay(SITE.whatsappDigits)}
                    </a>
                  </li>
                ) : null}
                {SITE.phoneDigits ? (
                  <li className="flex items-center gap-2.5">
                    <PhoneIcon size={17} />
                    <a
                      className="underline-offset-4 hover:underline"
                      href={`tel:+${SITE.phoneDigits}`}
                    >
                      {formatPhoneDisplay(SITE.phoneDigits)}
                    </a>
                  </li>
                ) : null}
                {SITE.email ? (
                  <li className="flex items-center gap-2.5">
                    <MailIcon size={17} />
                    <a
                      className="underline-offset-4 hover:underline"
                      href={`mailto:${SITE.email}`}
                    >
                      {SITE.email}
                    </a>
                  </li>
                ) : null}
                {SITE.address ? (
                  <li className="flex items-start gap-2.5">
                    <PinIcon size={17} className="mt-1 shrink-0" />
                    <span>{SITE.address}</span>
                  </li>
                ) : null}
                {SITE.hours ? (
                  <li className="pl-7 text-brand-warm-white/60">
                    {SITE.hours}
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-3 max-w-xs text-[0.95rem] text-brand-warm-white/70">
                Questions about a bottle or an order? Use the contact page and
                we will get back to you.
              </p>
            )}
            {!hasContact ? (
              <Link
                href="/contact"
                className={`${linkClass} mt-2 font-semibold`}
              >
                Contact us
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Decorative wordmark — font-size derived from viewport so the full
          string stays on-screen (glyph run is ~6.2em at this face/stretch). */}
      <p
        aria-hidden="true"
        className="font-display-hero pointer-events-none -mb-[0.18em] w-full px-3 text-center leading-none whitespace-nowrap text-brand-warm-white/[0.07] select-none sm:px-4"
        style={{
          fontSize: "clamp(2.5rem, calc((100vw - 1.5rem) / 6.2), 16rem)",
        }}
      >
        IP SHAP
      </p>

      <div className="relative border-t border-brand-warm-white/12 bg-brand-charcoal">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-brand-warm-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <li>Prices in Rwandan francs (RWF)</li>
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center underline-offset-4 hover:text-brand-warm-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-2 border-t border-brand-warm-white/10 px-4 py-3 text-xs text-brand-warm-white/50 sm:px-6 lg:px-8">
          <span>Designed &amp; built by</span>
          <a
            href={DEVELOPER.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${DEVELOPER.name} (opens in a new tab)`}
            className="inline-flex items-center opacity-80 transition-opacity duration-[var(--motion-fast)] hover:opacity-100"
          >
            <Image
              src={DEVELOPER.logoOnDark}
              alt={DEVELOPER.name}
              width={DEVELOPER.logoOnDarkSize.width}
              height={DEVELOPER.logoOnDarkSize.height}
              className="h-8 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
