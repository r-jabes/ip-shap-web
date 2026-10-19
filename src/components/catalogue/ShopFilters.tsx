"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Brand, Category } from "@/domain/catalogue";

export function ShopFilters({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = {
    category: searchParams.get("category") ?? "",
    brand: searchParams.get("brand") ?? "",
    availability: searchParams.get("availability") ?? "all",
    sort: searchParams.get("sort") ?? "name_asc",
    q: searchParams.get("q") ?? "",
  };

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || (key === "availability" && value === "all")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  }

  const fields = (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="filter-q"
          className="text-xs tracking-[0.12em] uppercase"
        >
          Search
        </label>
        <input
          id="filter-q"
          defaultValue={current.q}
          onBlur={(event) => update("q", event.target.value.trim())}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              update("q", (event.target as HTMLInputElement).value.trim());
            }
          }}
          className="mt-2 w-full border border-brand-dark-neutral/25 bg-transparent px-3 py-2 text-sm"
          placeholder="Search demo drinks"
        />
      </div>
      <fieldset>
        <legend className="text-xs tracking-[0.12em] uppercase">
          Category
        </legend>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="category"
              checked={!current.category}
              onChange={() => update("category", "")}
            />
            All
          </label>
          {categories.map((category) => (
            <label key={category.slug} className="flex items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={current.category === category.slug}
                onChange={() => update("category", category.slug)}
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label
          htmlFor="filter-brand"
          className="text-xs tracking-[0.12em] uppercase"
        >
          Brand
        </label>
        <select
          id="filter-brand"
          value={current.brand}
          onChange={(event) => update("brand", event.target.value)}
          className="mt-2 w-full border border-brand-dark-neutral/25 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.slug} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="filter-availability"
          className="text-xs tracking-[0.12em] uppercase"
        >
          Availability
        </label>
        <select
          id="filter-availability"
          value={current.availability}
          onChange={(event) => update("availability", event.target.value)}
          className="mt-2 w-full border border-brand-dark-neutral/25 bg-transparent px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="in_stock">In stock (demo)</option>
          <option value="unknown">Unknown (demo)</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="filter-sort"
          className="text-xs tracking-[0.12em] uppercase"
        >
          Sort
        </label>
        <select
          id="filter-sort"
          value={current.sort}
          onChange={(event) => update("sort", event.target.value)}
          className="mt-2 w-full border border-brand-dark-neutral/25 bg-transparent px-3 py-2 text-sm"
        >
          <option value="name_asc">Name A–Z</option>
          <option value="price_asc">Price low–high</option>
          <option value="price_desc">Price high–low</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="mb-4 inline-flex border border-brand-charcoal/30 px-4 py-2 text-sm lg:hidden"
        onClick={() => setOpen(true)}
      >
        Filters & sort
      </button>

      <aside className="hidden lg:block">{fields}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="drawer-backdrop absolute inset-0 bg-brand-charcoal/50"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters and sort"
            className="drawer-panel-left absolute inset-y-0 left-0 w-[min(100%,22rem)] overflow-y-auto bg-brand-warm-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm underline"
              >
                Close
              </button>
            </div>
            {fields}
          </div>
        </div>
      ) : null}
    </>
  );
}
