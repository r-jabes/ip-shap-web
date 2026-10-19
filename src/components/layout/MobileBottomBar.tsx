"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChrome } from "@/components/layout/ChromeProvider";
import {
  GridIcon,
  HomeIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { chatHref } from "@/lib/site-config";

const itemClass =
  "flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold transition-colors duration-[var(--motion-fast)] active:bg-paper-2";

/** Thumb-reach navigation for phones. Hidden from `lg` up; the page reserves space for it. */
export function MobileBottomBar() {
  const { openSearch } = useChrome();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isShop = pathname === "/shop" || pathname.startsWith("/product/");

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--bottom-bar-h)] border-t border-line bg-brand-warm-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <Link
        href="/"
        aria-current={isHome ? "page" : undefined}
        className={`${itemClass} ${isHome ? "text-brand-charcoal" : "text-ink-muted"}`}
      >
        <HomeIcon size={22} />
        Home
      </Link>
      <Link
        href="/shop"
        aria-current={isShop ? "page" : undefined}
        className={`${itemClass} ${isShop ? "text-brand-charcoal" : "text-ink-muted"}`}
      >
        <GridIcon size={22} />
        Shop
      </Link>
      <button
        type="button"
        onClick={openSearch}
        aria-haspopup="dialog"
        className={`${itemClass} text-ink-muted`}
      >
        <SearchIcon size={22} />
        Search
      </button>
      <a
        href={chatHref("Hello, I would like to place an order.")}
        {...(chatHref().startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={`${itemClass} text-brand-charcoal`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-burnt-orange">
          <WhatsAppIcon size={17} />
        </span>
        Chat
      </a>
    </nav>
  );
}
