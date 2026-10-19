import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/catalogue/ProductGrid";
import { ShopFilters } from "@/components/catalogue/ShopFilters";
import { Container } from "@/components/ui/Container";
import type { AvailabilityFilter } from "@/domain/catalogue";
import Link from "next/link";
import {
  getBrands,
  getCategories,
  listProducts,
  paginateProducts,
} from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse whisky, vodka, gin and wine from THE IP SHAP BUSINESS LTD in Rwanda.",
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
  const pageParam = Number.parseInt(first(params.page) ?? "1", 10);

  const allProducts = listProducts({
    categorySlug,
    brandSlug,
    availability,
    sort,
    q,
  });
  const {
    items: products,
    page,
    totalPages,
    total,
  } = paginateProducts(allProducts, Number.isFinite(pageParam) ? pageParam : 1);
  const categories = getCategories();
  const brands = getBrands();

  function pageHref(target: number) {
    const next = new URLSearchParams();
    if (categorySlug) next.set("category", categorySlug);
    if (brandSlug) next.set("brand", brandSlug);
    if (availability && availability !== "all") {
      next.set("availability", availability);
    }
    if (sort && sort !== "name_asc") next.set("sort", sort);
    if (q) next.set("q", q);
    if (target > 1) next.set("page", String(target));
    const query = next.toString();
    return query ? `/shop?${query}` : "/shop";
  }

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
            Spirits and wine, ready to order. Pick what you like and send your
            order on WhatsApp.
          </p>
        </div>
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
            of {total} product{total === 1 ? "" : "s"}
            {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ""}
          </p>
          <ProductGrid products={products} />
          {totalPages > 1 ? (
            <nav
              className="mt-8 flex flex-wrap items-center gap-3 text-sm"
              aria-label="Catalogue pages"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="underline underline-offset-4"
                >
                  Previous
                </Link>
              ) : (
                <span className="text-brand-dark-neutral">Previous</span>
              )}
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="underline underline-offset-4"
                >
                  Next
                </Link>
              ) : (
                <span className="text-brand-dark-neutral">Next</span>
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
