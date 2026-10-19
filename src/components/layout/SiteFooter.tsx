import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Container } from "@/components/ui/Container";
import {
  ADDRESS_PLACEHOLDER,
  EMAIL_PLACEHOLDER,
  LEGAL_NAME,
  WHATSAPP_PLACEHOLDER,
} from "@/lib/brand";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/delivery", label: "Delivery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-brand-dark-neutral/20 bg-brand-charcoal text-brand-warm-white">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandLogo height={40} />
          <p className="mt-3 text-sm text-brand-warm-white/75">{LEGAL_NAME}</p>
          <p className="mt-4 max-w-sm text-sm text-brand-warm-white/65">
            Single-retailer drinks storefront prototype. Contact details below
            are placeholders awaiting owner confirmation.
          </p>
        </div>
        <div>
          <h2 className="text-xs tracking-[0.14em] text-brand-burnt-orange uppercase">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs tracking-[0.14em] text-brand-burnt-orange uppercase">
            Contact (to confirm)
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-brand-warm-white/80">
            <li>WhatsApp: {WHATSAPP_PLACEHOLDER}</li>
            <li>Email: {EMAIL_PLACEHOLDER}</li>
            <li>{ADDRESS_PLACEHOLDER}</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-brand-warm-white/10">
        <Container className="flex flex-col gap-2 py-4 text-xs text-brand-warm-white/55 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {LEGAL_NAME}
          </p>
          <p>Prototype — not a live ordering system</p>
        </Container>
      </div>
    </footer>
  );
}
