"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FilterFacets } from "@/lib/catalogue";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Overlay } from "@/components/ui/Overlay";
import {
  buildShopHref,
  parseShopSearchParams,
  toggleInList,
  type ShopQuery,
} from "@/lib/shop-query";

export function ShopFilters({
  facets,
  resultCount,
}: {
  facets: FilterFacets;
  /** Matching products for the current URL (used on the mobile sheet CTA). */
  resultCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const query = useMemo(() => {
    const raw: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      const existing = raw[key];
      if (existing === undefined) raw[key] = value;
      else if (Array.isArray(existing)) existing.push(value);
      else raw[key] = [existing, value];
    });
    return parseShopSearchParams(raw);
  }, [searchParams]);

  function push(next: Partial<ShopQuery>) {
    router.push(buildShopHref({ ...next, page: 1 }, query));
  }

  const fields = <FilterFields query={query} facets={facets} onChange={push} />;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open filters and sort"
      >
        Filters & sort
      </Button>

      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+1rem)] max-h-[calc(100dvh-var(--header-h)-2rem)] space-y-8 overflow-y-auto pr-1 pb-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">Filters</h2>
            {hasActiveFilters(query) ? (
              <Button href="/shop" variant="link" size="sm">
                Clear all
              </Button>
            ) : null}
          </div>
          {fields}
        </div>
      </aside>

      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        side="left"
        label="Filters and sort"
        panelClassName="flex h-full w-[min(100%,22rem)] flex-col border-r-2 border-brand-charcoal bg-brand-warm-white"
      >
        <div className="flex items-center justify-between gap-3 border-b border-brand-charcoal/15 px-5 py-4">
          <h2 className="font-display text-xl">Filters</h2>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{fields}</div>
        <div className="border-t border-brand-charcoal/15 p-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Show {resultCount} result{resultCount === 1 ? "" : "s"}
          </Button>
        </div>
      </Overlay>
    </>
  );
}

function hasActiveFilters(query: ShopQuery) {
  return (
    query.categories.length > 0 ||
    query.brands.length > 0 ||
    query.availability !== "all" ||
    typeof query.minPrice === "number" ||
    typeof query.maxPrice === "number" ||
    !!query.q
  );
}

function FilterFields({
  query,
  facets,
  onChange,
}: {
  query: ShopQuery;
  facets: FilterFacets;
  onChange: (next: Partial<ShopQuery>) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <label
          htmlFor="filter-q"
          className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase"
        >
          Search
        </label>
        <input
          id="filter-q"
          key={query.q}
          defaultValue={query.q}
          onBlur={(event) =>
            onChange({ q: event.target.value.trim(), page: 1 })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onChange({
                q: (event.target as HTMLInputElement).value.trim(),
                page: 1,
              });
            }
          }}
          className="mt-2 w-full rounded-full border-2 border-brand-charcoal/25 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-charcoal"
          placeholder="Search drinks"
        />
      </div>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Range
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {facets.categories.map((category) => {
            const selected = query.categories.includes(category.slug);
            const disabled = !selected && category.count === 0;
            return (
              <Chip
                key={category.slug}
                selected={selected}
                count={category.count}
                disabled={disabled}
                onClick={() =>
                  onChange({
                    categories: toggleInList(query.categories, category.slug),
                    page: 1,
                  })
                }
              >
                {category.name}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Brand
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {facets.brands.map((brand) => {
            const selected = query.brands.includes(brand.slug);
            const disabled = !selected && brand.count === 0;
            return (
              <Chip
                key={brand.slug}
                selected={selected}
                count={brand.count}
                disabled={disabled}
                onClick={() =>
                  onChange({
                    brands: toggleInList(query.brands, brand.slug),
                    page: 1,
                  })
                }
              >
                {brand.name}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Availability
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip
            selected={query.availability === "all"}
            onClick={() => onChange({ availability: "all", page: 1 })}
          >
            All
          </Chip>
          {facets.availability.map((option) => {
            const selected = query.availability === option.value;
            const disabled = !selected && option.count === 0;
            return (
              <Chip
                key={option.value}
                selected={selected}
                count={option.count}
                disabled={disabled}
                onClick={() =>
                  onChange({ availability: option.value, page: 1 })
                }
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Price (RWF)
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-muted">
            Min
            <input
              type="number"
              inputMode="numeric"
              min={facets.priceBounds.min}
              max={facets.priceBounds.max}
              step={1000}
              key={`min-${query.minPrice ?? ""}`}
              defaultValue={query.minPrice ?? ""}
              placeholder={String(facets.priceBounds.min)}
              onBlur={(event) => {
                const raw = event.target.value.trim();
                onChange({
                  minPrice: raw ? Number.parseInt(raw, 10) : undefined,
                  page: 1,
                });
              }}
              className="mt-1.5 w-full rounded-full border-2 border-brand-charcoal/25 bg-transparent px-3 py-2 text-sm tabular outline-none focus:border-brand-charcoal"
            />
          </label>
          <label className="text-xs text-ink-muted">
            Max
            <input
              type="number"
              inputMode="numeric"
              min={facets.priceBounds.min}
              max={facets.priceBounds.max}
              step={1000}
              key={`max-${query.maxPrice ?? ""}`}
              defaultValue={query.maxPrice ?? ""}
              placeholder={String(facets.priceBounds.max)}
              onBlur={(event) => {
                const raw = event.target.value.trim();
                onChange({
                  maxPrice: raw ? Number.parseInt(raw, 10) : undefined,
                  page: 1,
                });
              }}
              className="mt-1.5 w-full rounded-full border-2 border-brand-charcoal/25 bg-transparent px-3 py-2 text-sm tabular outline-none focus:border-brand-charcoal"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Catalogue from {facets.priceBounds.min.toLocaleString("en-RW")} to{" "}
          {facets.priceBounds.max.toLocaleString("en-RW")} RWF.
        </p>
      </fieldset>

      <div>
        <label
          htmlFor="filter-sort"
          className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase"
        >
          Sort
        </label>
        <select
          id="filter-sort"
          value={query.sort}
          onChange={(event) =>
            onChange({
              sort: event.target.value as ShopQuery["sort"],
              page: 1,
            })
          }
          className="mt-2 w-full rounded-full border-2 border-brand-charcoal/25 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-charcoal"
        >
          <option value="name_asc">Name A–Z</option>
          <option value="price_asc">Price low–high</option>
          <option value="price_desc">Price high–low</option>
        </select>
      </div>
    </div>
  );
}
