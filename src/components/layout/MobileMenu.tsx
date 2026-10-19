"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useChrome } from "@/components/layout/ChromeProvider";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Overlay } from "@/components/ui/Overlay";
import { CloseIcon, WhatsAppIcon } from "@/components/ui/icons";
import type { NavGroup } from "@/lib/navigation";
import { chatHref } from "@/lib/site-config";

const secondary = [
  { href: "/about", label: "About" },
  { href: "/delivery", label: "Delivery" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const { menuOpen, closeMenu } = useChrome();
  const pathname = usePathname();

  // Close after navigation.
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  return (
    <Overlay
      open={menuOpen}
      onClose={closeMenu}
      side="left"
      label="Menu"
      panelClassName="on-ink flex h-dvh w-[min(100vw,26rem)] flex-col overflow-y-auto bg-brand-charcoal text-brand-warm-white"
    >
      <div className="flex items-center justify-between px-5 pt-5">
        <BrandLogo tone="on-ink" height={40} href="/" />
        <IconButton label="Close menu" tone="on-dark" onClick={closeMenu}>
          <CloseIcon size={20} />
        </IconButton>
      </div>

      <nav aria-label="Mobile" className="flex-1 px-5 py-8">
        <ul className="space-y-1">
          <li>
            <Link
              href="/shop"
              className="font-display block py-2 text-4xl uppercase transition-colors hover:text-brand-burnt-orange"
            >
              Shop all
            </Link>
          </li>
        </ul>

        {groups.map((group) => (
          <section key={group.title} className="mt-6">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-brand-burnt-orange uppercase">
              {group.title}
            </h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-4">
              {group.categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="flex min-h-11 items-center justify-between border-b border-brand-warm-white/10 text-lg"
                  >
                    {category.name}
                    <span className="text-xs text-brand-warm-white/50 tabular">
                      {category.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-sm text-brand-warm-white/75">
          {secondary.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-brand-warm-white/10 p-5">
        <Button
          href={chatHref("Hello, I would like to place an order.")}
          variant="primary"
          className="w-full"
          iconLeft={<WhatsAppIcon size={18} />}
        >
          Order on WhatsApp
        </Button>
      </div>
    </Overlay>
  );
}
