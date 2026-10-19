import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { whatsappLink, SITE, formatPhoneDisplay } from "@/lib/site-config";
import { LEGAL_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const whatsapp = whatsappLink("Hello, I would like to ask about an order.");
  const channels: Array<{
    key: string;
    label: string;
    value: string;
    href?: string;
    icon: React.ReactNode;
  }> = [];

  if (whatsapp && SITE.whatsappDigits) {
    channels.push({
      key: "whatsapp",
      label: "WhatsApp",
      value: formatPhoneDisplay(SITE.whatsappDigits),
      href: whatsapp,
      icon: <WhatsAppIcon size={22} />,
    });
  }
  if (SITE.phoneDigits) {
    channels.push({
      key: "phone",
      label: "Phone",
      value: formatPhoneDisplay(SITE.phoneDigits),
      href: `tel:+${SITE.phoneDigits}`,
      icon: <PhoneIcon size={22} />,
    });
  }
  if (SITE.email) {
    channels.push({
      key: "email",
      label: "Email",
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
      icon: <PinIcon size={22} />,
    });
  }

  return (
    <Container className="py-12 lg:max-w-3xl lg:py-16">
      <h1 className="font-display" style={{ fontSize: "var(--type-display)" }}>
        Contact
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        Questions about a bottle or an order? Reach {LEGAL_NAME} here.
      </p>

      {channels.length > 0 ? (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {channels.map((channel) => (
            <li
              key={channel.key}
              className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal p-5"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                {channel.icon}
                {channel.label}
              </span>
              {channel.href ? (
                <a
                  href={channel.href}
                  className="font-display mt-2 block text-xl break-words underline-offset-4 hover:underline"
                >
                  {channel.value}
                </a>
              ) : (
                <p className="font-display mt-2 text-xl">{channel.value}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-[var(--radius-panel)] border-2 border-dashed border-line-strong p-6 text-ink-muted">
          Our contact details are being added. In the meantime, place your order
          through the shop and we will get back to you.
        </p>
      )}

      {SITE.hours ? (
        <p className="mt-6 text-ink-muted">Hours: {SITE.hours}</p>
      ) : null}

      <Button href="/shop" className="mt-10">
        Browse the shop
      </Button>
    </Container>
  );
}
