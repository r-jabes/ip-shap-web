"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FilterFacets } from "@/lib/catalogue";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
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
        {hasActiveFilters(query) ? (
          <span className="ml-1 tabular text-brand-burnt-orange">
            ({activeFilterCount(query)})
          </span>
        ) : null}
      </Button>

      {/*
        Sticky sidebar: pins under the header while the product column scrolls.
        The aside must stretch to the full row height (lg:self-stretch) — a
        sticky child can only travel inside its parent, so an items-start grid
        would pin it only for its own height.
        One scroll surface only (panel itself) — lists do not nest overflow.
        Scrollbar styled via .shop-filters-scroll in globals.css.
        PageEnter must not leave a CSS transform on an ancestor.
      */}
      <aside className="hidden lg:block lg:self-stretch">
        <div className="shop-filters-scroll sticky top-[calc(var(--header-h)+0.75rem)] z-[1] max-h-[calc(100dvh-var(--header-h)-1.5rem)] overflow-y-auto overscroll-contain rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-5 shadow-[4px_4px_0_0_var(--brand-charcoal)]">
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-brand-charcoal/10 pb-4">
            <div>
              <h2 className="font-display text-xl">Filters</h2>
              <p className="mt-1 text-xs text-ink-muted">
                Ranges and brands update with the catalogue.
              </p>
            </div>
            {hasActiveFilters(query) ? (
              <Button href="/shop" variant="link" size="sm">
                Clear
              </Button>
            ) : null}
          </div>
          <div className="pt-5">{fields}</div>
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
        <div className="shop-filters-scroll flex-1 overflow-y-auto px-5 py-5">
          {fields}
        </div>
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
  return activeFilterCount(query) > 0;
}

function activeFilterCount(query: ShopQuery) {
  let count = query.categories.length + query.brands.length;
  if (query.availability !== "all") count += 1;
  if (typeof query.minPrice === "number") count += 1;
  if (typeof query.maxPrice === "number") count += 1;
  if (query.q) count += 1;
  return count;
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
  const [brandQuery, setBrandQuery] = useState("");
  const [rangeOpen, setRangeOpen] = useState(true);
  // Collapse long brand lists by default so the sticky panel stays compact.
  const [brandOpen, setBrandOpen] = useState(facets.brands.length <= 8);

  const filteredBrands = useMemo(() => {
    const needle = brandQuery.trim().toLowerCase();
    if (!needle) return facets.brands;
    return facets.brands.filter((brand) =>
      brand.name.toLowerCase().includes(needle),
    );
  }, [brandQuery, facets.brands]);

  return (
    <div className="space-y-6">
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

      <FilterSection
        title="Range"
        hint={`${facets.categories.length} in catalogue`}
        open={rangeOpen}
        onToggle={() => setRangeOpen((value) => !value)}
        selectedCount={query.categories.length}
      >
        <ul className="space-y-1">
          {facets.categories.map((category) => {
            const selected = query.categories.includes(category.slug);
            const disabled = !selected && category.count === 0;
            return (
              <li key={category.slug}>
                <Checkbox
                  label={category.name}
                  count={category.count}
                  checked={selected}
                  disabled={disabled}
                  onChange={() =>
                    onChange({
                      categories: toggleInList(
                        query.categories,
                        category.slug,
                      ),
                      page: 1,
                    })
                  }
                />
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection
        title="Brand"
        hint={`${facets.brands.length} in catalogue`}
        open={brandOpen}
        onToggle={() => setBrandOpen((value) => !value)}
        selectedCount={query.brands.length}
      >
        {facets.brands.length > 6 ? (
          <input
            type="search"
            value={brandQuery}
            onChange={(event) => setBrandQuery(event.target.value)}
            placeholder="Find a brand"
            className="mb-3 w-full rounded-full border-2 border-brand-charcoal/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-charcoal"
            aria-label="Filter brand list"
          />
        ) : null}
        <ul className="space-y-1">
          {filteredBrands.map((brand) => {
            const selected = query.brands.includes(brand.slug);
            const disabled = !selected && brand.count === 0;
            return (
              <li key={brand.slug}>
                <Checkbox
                  label={brand.name}
                  count={brand.count}
                  checked={selected}
                  disabled={disabled}
                  onChange={() =>
                    onChange({
                      brands: toggleInList(query.brands, brand.slug),
                      page: 1,
                    })
                  }
                />
              </li>
            );
          })}
          {filteredBrands.length === 0 ? (
            <li className="px-1 py-2 text-sm text-ink-muted">No brands match.</li>
          ) : null}
        </ul>
      </FilterSection>

      <fieldset>
        <legend className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Availability
        </legend>
        <ul className="mt-2 space-y-1">
          <li>
            <Checkbox
              label="All"
              checked={query.availability === "all"}
              onChange={() => onChange({ availability: "all", page: 1 })}
            />
          </li>
          {facets.availability.map((option) => {
            const selected = query.availability === option.value;
            const disabled = !selected && option.count === 0;
            return (
              <li key={option.value}>
                <Checkbox
                  label={option.label}
                  count={option.count}
                  checked={selected}
                  disabled={disabled}
                  onChange={() =>
                    onChange({ availability: option.value, page: 1 })
                  }
                />
              </li>
            );
          })}
        </ul>
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
          From {facets.priceBounds.min.toLocaleString("en-RW")} to{" "}
          {facets.priceBounds.max.toLocaleString("en-RW")} RWF in the current
          catalogue.
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

function FilterSection({
  title,
  hint,
  open,
  onToggle,
  selectedCount,
  children,
}: {
  title: string;
  hint: string;
  open: boolean;
  onToggle: () => void;
  selectedCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-brand-charcoal/10 pt-5 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span>
          <span className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {title}
            {selectedCount > 0 ? (
              <span className="ml-1.5 text-brand-burnt-orange tabular">
                {selectedCount}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>
        </span>
        <span aria-hidden="true" className="text-lg leading-none text-ink-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
