import type { Metadata } from "next";
import { ContactEnquiryForm } from "@/components/content/ContactEnquiryForm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { LEGAL_NAME } from "@/lib/brand";
import {
  formatPhoneDisplay,
  mapsLink,
  SITE,
  whatsappLink,
} from "@/lib/site-config";
import { turnstileSiteKey } from "@/lib/security/turnstile";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const whatsapp = whatsappLink("Hello, I would like to ask about an order.");
  const map = mapsLink();
  const botSiteKey = turnstileSiteKey();

  const channels: Array<{
    key: string;
    label: string;
    value: string;
    href?: string;
    icon: React.ReactNode;
  }> = [];

  if (SITE.phoneDigits) {
    channels.push({
      key: "phone",
      label: "Call",
      value: formatPhoneDisplay(SITE.phoneDigits),
      href: `tel:+${SITE.phoneDigits}`,
      icon: <PhoneIcon size={22} />,
    });
  }
  if (SITE.email) {
    channels.push({
      key: "email",
      label: "Business email",
      value: SITE.email,
      href: `mailto:${SITE.email}`,
      icon: <MailIcon size={22} />,
    });
  }
  if (SITE.address) {
    channels.push({
      key: "address",
      label: "Visit",
      value: SITE.address,
      href: map ?? undefined,
      icon: <PinIcon size={22} />,
    });
  }

  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Get in touch
        </p>
        <h1
          className="font-display mt-3 text-brand-charcoal"
          style={{ fontSize: "var(--type-display)" }}
        >
          Contact
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Questions about a bottle or an order? Reach {LEGAL_NAME} here.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
        <div className="space-y-6">
          {whatsapp && SITE.whatsappDigits ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-charcoal p-6 text-brand-warm-white shadow-[6px_6px_0_0_var(--brand-burnt-orange)] transition-[transform,box-shadow] duration-[var(--motion-ui)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[8px_8px_0_0_var(--brand-burnt-orange)]"
            >
              <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-brand-burnt-orange uppercase">
                <WhatsAppIcon size={18} />
                Preferred
              </span>
              <span className="font-display mt-3 block text-3xl">
                WhatsApp
              </span>
              <span className="mt-2 block text-brand-warm-white/75">
                Message us · {formatPhoneDisplay(SITE.whatsappDigits)}
              </span>
              <span className="mt-4 inline-block text-sm font-semibold underline decoration-brand-burnt-orange decoration-2 underline-offset-4">
                Open chat
              </span>
            </a>
          ) : (
            <div className="rounded-[var(--radius-panel)] border-2 border-dashed border-brand-charcoal/30 bg-paper-2/50 p-6">
              <p className="font-display text-2xl text-brand-charcoal">
                WhatsApp coming soon
              </p>
              <p className="mt-2 text-ink-muted">
                Place your order through the shop and we will follow up. Published
                contact details appear here as soon as they are confirmed.
              </p>
              <Button href="/shop" className="mt-6">
                Browse the shop
              </Button>
            </div>
          )}

          {channels.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {channels.map((channel) => (
                <li
                  key={channel.key}
                  className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-5 shadow-[3px_3px_0_0_var(--brand-charcoal)]"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                    {channel.icon}
                    {channel.label}
                  </span>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="font-display mt-2 block text-xl break-words text-brand-charcoal underline-offset-4 hover:underline"
                      {...(channel.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <p className="font-display mt-2 text-xl">{channel.value}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {(SITE.hours || map) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
              {SITE.hours ? (
                <p>
                  <span className="font-semibold text-brand-charcoal">
                    Hours:{" "}
                  </span>
                  {SITE.hours}
                </p>
              ) : null}
              {map ? (
                <a
                  href={map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-charcoal underline decoration-brand-burnt-orange decoration-2 underline-offset-4"
                >
                  Open in Maps
                </a>
              ) : null}
            </div>
          )}
        </div>

        <ContactEnquiryForm turnstileSiteKey={botSiteKey} />
      </div>
    </Container>
  );
}
