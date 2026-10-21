"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { Overlay } from "@/components/ui/Overlay";
import { ArrowRightIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { formatDemoPrice } from "@/domain/catalogue";
import type { NavGroup } from "@/lib/navigation";
import type { ProductSuggestion } from "@/lib/search-suggest";
import { chatHref } from "@/lib/site-config";

const RECENT_KEY = "ip-shap-recent-searches-v1";
const MAX_RECENT = 5;

function readRecent(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(RECENT_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed
          .filter((v): v is string => typeof v === "string")
          .slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  try {
    const next = [term, ...readRecent().filter((t) => t !== term)].slice(
      0,
      MAX_RECENT,
    );
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable: recent searches are a convenience only
  }
}

export function SearchOverlay({
  open,
  onClose,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  groups: NavGroup[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [matchedCategories, setMatchedCategories] = useState<
    Array<{ slug: string; name: string }>
  >([]);

  useEffect(() => {
    if (open) {
      setRecent(readRecent());
    } else {
      setQuery("");
      setProducts([]);
      setMatchedCategories([]);
    }
  }, [open]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;

  // Debounced rate-limited suggest API (P7).
  useEffect(() => {
    if (!hasQuery) {
      setProducts([]);
      setMatchedCategories([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const body = (await res.json()) as {
          products?: ProductSuggestion[];
          categories?: Array<{ slug: string; name: string }>;
        };
        setProducts(body.products ?? []);
        setMatchedCategories(body.categories ?? []);
      } catch {
        // Aborted or network — keep prior results
      }
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [trimmed, hasQuery]);

  function submit(term: string) {
    const value = term.trim();
    if (!value) return;
    saveRecent(value);
    onClose();
    router.push(`/shop?q=${encodeURIComponent(value)}`);
  }

  function moveFocus(event: React.KeyboardEvent, direction: 1 | -1) {
    const links = Array.from(
      resultsRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [],
    );
    if (links.length === 0) return;
    const index = links.indexOf(document.activeElement as HTMLElement);
    if (index === -1 && direction === 1) {
      event.preventDefault();
      links[0]?.focus();
    } else if (index !== -1) {
      event.preventDefault();
      const next = index + direction;
      if (next < 0) inputRef.current?.focus();
      else links[Math.min(next, links.length - 1)]?.focus();
    }
  }

  return (
    <Overlay
      open={open}
      onClose={onClose}
      side="top"
      label="Search the shop"
      initialFocusRef={inputRef}
      panelClassName="w-full sm:max-w-3xl sm:mt-6 max-h-[100dvh] sm:max-h-[min(40rem,calc(100dvh-3rem))] overflow-hidden flex flex-col bg-brand-warm-white text-brand-charcoal sm:rounded-[var(--radius-panel)] shadow-[var(--shadow-overlay)]"
    >
      <form
        role="search"
        className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6 sm:py-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
      >
        <SearchIcon size={22} />
        <label htmlFor="overlay-search" className="sr-only">
          Search drinks
        </label>
        <input
          ref={inputRef}
          id="overlay-search"
          type="search"
          value={query}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search whisky, wine, gin…"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") moveFocus(event, 1);
          }}
          className="font-display h-12 min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-ink-muted sm:text-2xl"
        />
        <IconButton label="Close search" size="sm" onClick={onClose}>
          <CloseIcon size={18} />
        </IconButton>
      </form>

      <div
        className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") moveFocus(event, 1);
          if (event.key === "ArrowUp") moveFocus(event, -1);
        }}
      >
        <div aria-live="polite" className="sr-only">
          {hasQuery
            ? `${products.length} product suggestion${products.length === 1 ? "" : "s"}`
            : ""}
        </div>

        {!hasQuery ? (
          <div className="space-y-8">
            {recent.length > 0 ? (
              <section aria-labelledby="recent-title">
                <h2
                  id="recent-title"
                  className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase"
                >
                  Recent searches
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recent.map((term) => (
                    <Chip key={term} onClick={() => submit(term)}>
                      {term}
                    </Chip>
                  ))}
                </div>
              </section>
            ) : null}
            <section aria-labelledby="browse-title">
              <h2
                id="browse-title"
                className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase"
              >
                Browse by category
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {groups
                  .flatMap((group) => group.categories)
                  .map((category) => (
                    <Chip
                      key={category.slug}
                      href={`/shop?category=${category.slug}`}
                      count={category.count}
                    >
                      {category.name}
                    </Chip>
                  ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            {matchedCategories.length > 0 ? (
              <section aria-label="Matching categories">
                <div className="flex flex-wrap gap-2">
                  {matchedCategories.map((category) => (
                    <Chip
                      key={category.slug}
                      href={`/shop?category=${category.slug}`}
                    >
                      Shop {category.name}
                    </Chip>
                  ))}
                </div>
              </section>
            ) : null}

            {products.length > 0 ? (
              <ul ref={resultsRef} className="-mx-2 space-y-1">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        saveRecent(trimmed);
                        onClose();
                      }}
                      className="flex items-center gap-4 rounded-2xl p-2 transition-colors duration-[var(--motion-fast)] hover:bg-paper-2 focus-visible:bg-paper-2"
                    >
                      <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                        {product.imageSrc ? (
                          <Image
                            src={product.imageSrc}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs tracking-[0.1em] text-ink-muted uppercase">
                          {product.brandName}
                        </span>
                        <span className="block truncate font-semibold">
                          {product.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular">
                        {formatDemoPrice({
                          amount: product.priceAmount,
                          currency: "RWF",
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 text-center">
                <p className="font-display text-xl">
                  No matches for “{trimmed}”
                </p>
                <p className="mt-2 text-sm text-ink-muted">
                  Check the spelling, try a brand or category — or ask us and we
                  will help you find it.
                </p>
                <Link
                  href={chatHref(`Hello, I am looking for: ${trimmed}`)}
                  onClick={onClose}
                  className="mt-4 inline-flex text-sm font-semibold underline decoration-brand-burnt-orange decoration-2 underline-offset-[6px]"
                >
                  Ask us about it
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => submit(trimmed)}
              className="flex w-full items-center justify-between rounded-2xl border border-line px-4 py-3 text-left font-semibold transition-colors duration-[var(--motion-fast)] hover:bg-paper-2"
            >
              <span>See all results for “{trimmed}”</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        )}
      </div>

      <p className="hidden border-t border-line px-6 py-2.5 text-xs text-ink-muted sm:block">
        <kbd className="rounded border border-line px-1.5 py-0.5 font-sans">
          ↑
        </kbd>{" "}
        <kbd className="rounded border border-line px-1.5 py-0.5 font-sans">
          ↓
        </kbd>{" "}
        to move ·{" "}
        <kbd className="rounded border border-line px-1.5 py-0.5 font-sans">
          Enter
        </kbd>{" "}
        to search ·{" "}
        <kbd className="rounded border border-line px-1.5 py-0.5 font-sans">
          Esc
        </kbd>{" "}
        to close
      </p>
    </Overlay>
  );
}
