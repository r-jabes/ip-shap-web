import { Suspense } from "react";
import type { Metadata } from "next";
import { AppliedFilterChips } from "@/components/catalogue/AppliedFilterChips";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/catalogue/ProductGrid";
import { ShopFilters } from "@/components/catalogue/ShopFilters";
import { ShopNoResults } from "@/components/catalogue/ShopNoResults";
import { ShopPagination } from "@/components/catalogue/ShopPagination";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getCachedCategories } from "@/lib/catalogue/cache";
import { getShopListing } from "@/lib/catalogue/storefront";
import { shopMetadata } from "@/lib/seo";
import {
  buildShopHref,
  parseShopSearchParams,
  shopQueryToFilters,
} from "@/lib/shop-query";

/** Revalidate when catalogue cache tag is busted; also soft TTL. */
export const revalidate = 3600;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = parseShopSearchParams(params);
  const categories = await getCachedCategories();
  const activeCategory =
    query.categories.length === 1
      ? categories.find((category) => category.slug === query.categories[0])
      : undefined;
  return shopMetadata({
    category: activeCategory,
    q: query.q,
    hasExtraFilters:
      query.brands.length > 0 ||
      query.availability !== "all" ||
      typeof query.minPrice === "number" ||
      typeof query.maxPrice === "number" ||
      query.categories.length > 1,
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = parseShopSearchParams(params);
  const filters = shopQueryToFilters(query);
  const {
    products,
    page,
    totalPages,
    total,
    facets,
    categories,
    brands,
  } = await getShopListing(filters, query.page);

  const categoryNames = Object.fromEntries(
    categories.map((category) => [category.slug, category.name]),
  );
  const brandNames = Object.fromEntries(
    brands.map((brand) => [brand.slug, brand.name]),
  );

  const activeCategory =
    query.categories.length === 1
      ? categories.find((category) => category.slug === query.categories[0])
      : undefined;

  return (
    <Container className="py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: activeCategory ? "/shop" : undefined },
          ...(activeCategory ? [{ name: activeCategory.name }] : []),
        ]}
      />

      <header className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">
          Catalogue
        </p>
        <h1
          className="font-display mt-2 text-brand-charcoal"
          style={{ fontSize: "clamp(2rem, 1.4rem + 2vw, 3rem)" }}
        >
          {activeCategory ? activeCategory.name : "Shop drinks"}
        </h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          {activeCategory?.description ??
            "Wines, spirits, beer and soft drinks, ready to order. Pick what you need and check out on this site."}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18.5rem_minmax(0,1fr)] lg:items-start lg:gap-10">
        <Suspense
          fallback={
            <div
              className="hidden h-[28rem] animate-pulse rounded-[var(--radius-panel)] border-2 border-brand-charcoal/10 bg-brand-charcoal/5 lg:block"
              aria-hidden="true"
            />
          }
        >
          <ShopFilters facets={facets} resultCount={total} />
        </Suspense>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm text-ink-muted">
              Showing{" "}
              <span className="font-semibold text-brand-charcoal tabular">
                {products.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-brand-charcoal tabular">
                {total}
              </span>{" "}
              {total === 1 ? "drink" : "drinks"}
              {totalPages > 1 ? (
                <>
                  {" "}
                  · page{" "}
                  <span className="tabular">
                    {page}/{totalPages}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div className="mb-6">
            <AppliedFilterChips
              query={query}
              categoryNames={categoryNames}
              brandNames={brandNames}
            />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              products={products}
              emptyState={
                <ShopNoResults
                  searchText={query.q || undefined}
                  hasFilters={
                    query.categories.length > 0 ||
                    query.brands.length > 0 ||
                    query.availability !== "all" ||
                    typeof query.minPrice === "number" ||
                    typeof query.maxPrice === "number"
                  }
                  suggestions={categories
                    .filter((category) => !query.categories.includes(category.slug))
                    .slice(0, 8)}
                />
              }
            />
          </Suspense>

          <ShopPagination
            page={page}
            totalPages={totalPages}
            buildHref={(target) => buildShopHref({ page: target }, query)}
          />
        </div>
      </div>
    </Container>
  );
}
