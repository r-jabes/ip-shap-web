"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useCart } from "@/components/cart/CartProvider";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=spirits", label: "Spirits" },
  { href: "/shop?category=wine", label: "Wine" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { itemCount, openCart, feedback } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const previousCount = useRef(itemCount);

  useEffect(() => {
    if (itemCount === previousCount.current) return;
    previousCount.current = itemCount;
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 240);
    return () => window.clearTimeout(id);
  }, [itemCount]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-dark-neutral/20 bg-brand-charcoal text-brand-warm-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-brand-warm-white/25 text-sm transition-opacity duration-[var(--motion-fast)] lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true">{mobileOpen ? "✕" : "☰"}</span>
          </button>
          <BrandLogo height={34} priority />
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="underline-offset-4 transition-opacity duration-[var(--motion-fast)] hover:opacity-80 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <form action="/shop" className="hidden md:block" role="search">
            <label htmlFor="header-search" className="sr-only">
              Search drinks
            </label>
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Search"
              className="w-40 border border-brand-warm-white/25 bg-transparent px-3 py-2 text-sm text-brand-warm-white placeholder:text-brand-warm-white/50 lg:w-48"
            />
          </form>
          <button
            type="button"
            onClick={openCart}
            className="relative border border-brand-warm-white/25 px-3 py-2 text-sm transition-colors duration-[var(--motion-ui)] hover:border-brand-burnt-orange"
            aria-label={`Open cart, ${itemCount} items`}
          >
            Cart
            <span
              className={`ml-2 inline-flex min-w-5 items-center justify-center bg-brand-burnt-orange px-1.5 text-xs text-brand-charcoal ${
                pulse ? "cart-count--pulse" : ""
              }`}
            >
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {feedback}
      </p>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-brand-warm-white/10 lg:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="block py-2 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <form action="/shop" className="pt-2" role="search">
                <label htmlFor="mobile-search" className="sr-only">
                  Search drinks
                </label>
                <input
                  id="mobile-search"
                  name="q"
                  type="search"
                  placeholder="Search drinks"
                  className="w-full border border-brand-warm-white/25 bg-transparent px-3 py-2 text-sm"
                />
              </form>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
