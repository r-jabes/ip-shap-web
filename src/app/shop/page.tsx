import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { ShopFilters } from "@/components/catalogue/ShopFilters";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import type { AvailabilityFilter } from "@/domain/catalogue";
import { getBrands, getCategories, listProducts } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop",
  description: "Demo drinks catalogue for THE IP SHAP BUSINESS LTD prototype.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categorySlug = first(params.category);
  const brandSlug = first(params.brand);
  const availability = (first(params.availability) ??
    "all") as AvailabilityFilter;
  const sort = (first(params.sort) ?? "name_asc") as
    "price_asc" | "price_desc" | "name_asc";
  const q = first(params.q);

  const products = listProducts({
    categorySlug,
    brandSlug,
    availability,
    sort,
    q,
  });
  const categories = getCategories();
  const brands = getBrands();

  return (
    <Container className="py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-dark-neutral/15 pb-6">
        <div>
          <p className="text-xs tracking-[0.16em] text-brand-dark-neutral uppercase">
            Catalogue
          </p>
          <h1
            className="mt-2 font-display"
            style={{ fontSize: "var(--type-h2)" }}
          >
            Shop drinks
          </h1>
          <p className="mt-2 max-w-xl text-sm text-brand-dark-neutral">
            Illustrative demo products for visual review. Filter patterns are
            ready for a 300+ SKU catalogue.
          </p>
        </div>
        <DemoBadge>Demo catalogue</DemoBadge>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <Suspense fallback={<div className="text-sm">Loading filters…</div>}>
          <ShopFilters categories={categories} brands={brands} />
        </Suspense>
        <div>
          <p className="mb-6 text-sm text-brand-dark-neutral">
            Showing{" "}
            <span className="font-medium text-brand-charcoal">
              {products.length}
            </span>{" "}
            demo product{products.length === 1 ? "" : "s"}
          </p>
          <ProductGrid products={products} />
        </div>
      </div>
    </Container>
  );
}
