import { Suspense } from "react";
import type { Metadata } from "next";
import { AppliedFilterChips } from "@/components/catalogue/AppliedFilterChips";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/catalogue/ProductGrid";
import { ShopFilters } from "@/components/catalogue/ShopFilters";
import { ShopPagination } from "@/components/catalogue/ShopPagination";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import {
  getBrands,
  getCategories,
  getFilterFacets,
  listProducts,
  paginateProducts,
} from "@/lib/catalogue";
import {
  buildShopHref,
  parseShopSearchParams,
  shopQueryToFilters,
} from "@/lib/shop-query";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse whisky, vodka, gin and wine from THE IP SHAP BUSINESS LTD in Rwanda.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = parseShopSearchParams(params);
  const filters = shopQueryToFilters(query);
  const allProducts = listProducts(filters);
  const {
    items: products,
    page,
    totalPages,
    total,
  } = paginateProducts(allProducts, query.page);
  const facets = getFilterFacets(filters);
  const categories = getCategories();
  const brands = getBrands();

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
            "Spirits and wine, ready to order. Pick what you like and send your order on WhatsApp."}
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
            <ProductGrid products={products} />
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
