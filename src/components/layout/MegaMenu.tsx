"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, ArrowRightIcon } from "@/components/ui/icons";
import type { NavData } from "@/lib/navigation";

/**
 * Desktop "Shop" mega menu. Opens on hover (with a short close delay so diagonal mouse movement
 * does not dismiss it), on click/Enter/Space, closes on Escape, outside click, focus leaving the
 * menu and route change. Content is generated from the catalogue (groups, counts, promo).
 */
export function MegaMenu({ nav }: { nav: NavData }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);
  const panelId = useId();
  const pathname = usePathname();

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  }, [cancelClose]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const shopActive = pathname === "/shop" || pathname.startsWith("/product/");

  return (
    <li
      ref={rootRef}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          cancelClose();
          setOpen(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") scheduleClose();
      }}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[0.95rem] font-semibold transition-colors duration-[var(--motion-fast)] hover:bg-paper-2"
        data-active={shopActive || undefined}
      >
        <span
          className={`border-b-2 pb-0.5 ${shopActive ? "border-brand-burnt-orange" : "border-transparent"}`}
        >
          Shop
        </span>
        <ChevronDownIcon
          size={16}
          className={`transition-transform duration-[var(--motion-ui)] motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-line bg-brand-warm-white shadow-[var(--shadow-overlay)]"
      >
        {open ? (
          <div className="overlay-from-top mx-auto grid max-w-7xl gap-10 px-8 py-9 lg:grid-cols-[1fr_1fr_20rem]">
            {nav.groups.map((group) => (
              <section key={group.title} aria-label={group.title}>
                <h2 className="text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-1">
                  {group.categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/shop?category=${category.slug}`}
                        className="group/item -mx-3 flex items-baseline justify-between gap-4 rounded-2xl px-3 py-2.5 transition-colors duration-[var(--motion-fast)] hover:bg-paper-2"
                      >
                        <span>
                          <span className="font-display block text-2xl">
                            {category.name}
                          </span>
                          <span className="block text-sm text-ink-muted">
                            {category.description}
                          </span>
                        </span>
                        <span className="text-sm text-ink-muted tabular">
                          {category.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <div className="flex flex-col gap-4">
              {nav.promo ? (
                <Link
                  href={nav.promo.href}
                  className="group/promo relative block overflow-hidden rounded-[var(--radius-frame)] bg-paper-2"
                >
                  <Image
                    src={nav.promo.imageSrc}
                    alt={nav.promo.imageAlt}
                    width={nav.promo.imageWidth}
                    height={nav.promo.imageHeight}
                    sizes="320px"
                    className="aspect-[4/3] w-full object-cover object-[50%_58%] transition-transform duration-[var(--motion-editorial)] ease-[var(--ease-out)] group-hover/promo:scale-[1.04] motion-reduce:transition-none"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-charcoal/85 to-transparent p-4 pt-10 text-brand-warm-white">
                    <span className="block text-[0.68rem] font-semibold tracking-[0.18em] text-brand-burnt-orange uppercase">
                      {nav.promo.eyebrow}
                    </span>
                    <span className="font-display mt-1 block text-lg leading-tight">
                      {nav.promo.title}
                    </span>
                  </span>
                </Link>
              ) : null}
              <Link
                href="/shop"
                className="inline-flex items-center justify-between rounded-full border-2 border-brand-charcoal px-5 py-3 text-sm font-semibold transition-colors duration-[var(--motion-fast)] hover:bg-brand-charcoal hover:text-brand-warm-white"
              >
                Shop all {nav.totalProducts} products
                <ArrowRightIcon size={18} />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
