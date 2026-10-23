"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useCart } from "@/components/cart/CartProvider";
import { useChrome } from "@/components/layout/ChromeProvider";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import {
  BagIcon,
  MenuIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { cartSummaryLabel } from "@/lib/cart";
import type { NavData } from "@/lib/navigation";
import { chatHref } from "@/lib/site-config";

const links = [
  { href: "/about", label: "About" },
  { href: "/delivery", label: "Delivery" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ nav }: { nav: NavData }) {
  const { itemCount, productCount, openCart, feedback } = useCart();
  const { openSearch, openMenu } = useChrome();
  const pathname = usePathname();
  const [pulse, setPulse] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const previousCount = useRef(itemCount);

  // Pulse on any change to what is in the cart (units, not just the product count).
  useEffect(() => {
    if (itemCount === previousCount.current) return;
    previousCount.current = itemCount;
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 560);
    return () => window.clearTimeout(id);
  }, [itemCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`relative sticky top-0 z-40 border-b bg-brand-warm-white/95 backdrop-blur-md transition-shadow duration-[var(--motion-ui)] motion-reduce:transition-none ${
        scrolled
          ? "border-line shadow-[0_10px_30px_-22px_rgb(32_32_30/0.55)]"
          : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[var(--header-h)] w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:gap-4 lg:px-8">
        <div className="lg:hidden">
          <IconButton
            label="Open menu"
            onClick={openMenu}
            aria-haspopup="dialog"
          >
            <MenuIcon size={22} />
          </IconButton>
        </div>

        <BrandLogo tone="on-paper" height={40} priority className="shrink-0" />

        <nav aria-label="Primary" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            <MegaMenu nav={nav} />
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="inline-flex h-11 items-center rounded-full px-4 text-[0.95rem] font-semibold transition-colors duration-[var(--motion-fast)] hover:bg-paper-2"
                  >
                    <span
                      className={`border-b-2 pb-0.5 ${active ? "border-brand-burnt-orange" : "border-transparent"}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            aria-haspopup="dialog"
            className="hidden h-11 items-center gap-3 rounded-full border border-brand-charcoal/25 bg-transparent pr-3 pl-4 text-sm text-ink-muted transition-colors duration-[var(--motion-fast)] hover:border-brand-charcoal md:inline-flex md:w-56 lg:w-64"
          >
            <SearchIcon size={18} className="text-brand-charcoal" />
            <span className="flex-1 text-left">Search drinks</span>
            <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-xs">
              /
            </kbd>
          </button>

          <div className="hidden xl:block">
            <Button
              href={chatHref("Hello, I would like to ask a question.")}
              size="sm"
              variant="ghost"
              iconLeft={<WhatsAppIcon size={17} />}
            >
              Contact us
            </Button>
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-haspopup="dialog"
            aria-label={
              productCount > 0
                ? `Open cart, ${cartSummaryLabel(productCount, itemCount)}`
                : "Open cart, empty"
            }
            className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-charcoal bg-brand-charcoal text-brand-warm-white transition-[transform,background-color,box-shadow] duration-[var(--motion-fast)] hover:bg-brand-dark-neutral active:scale-95 motion-reduce:transition-none ${
              pulse ? "cart-target--catch" : ""
            }`}
          >
            {pulse ? (
              <span aria-hidden="true" className="cart-fly-dot" />
            ) : null}
            <BagIcon size={20} />
            {productCount > 0 ? (
              <span
                aria-hidden="true"
                className={`absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-brand-warm-white bg-brand-burnt-orange px-1 text-[0.7rem] leading-none font-bold text-brand-charcoal tabular ${
                  pulse ? "cart-count--pulse" : ""
                }`}
              >
                {productCount > 99 ? "99+" : productCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {feedback}
      </p>
      {feedback ? (
        <div
          role="status"
          className="cart-toast pointer-events-none absolute top-full right-4 z-50 mt-2 max-w-xs rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-4 py-2 text-sm font-semibold text-brand-charcoal shadow-[3px_3px_0_0_var(--brand-burnt-orange)] sm:right-6"
        >
          {feedback}
        </div>
      ) : null}
    </header>
  );
}
