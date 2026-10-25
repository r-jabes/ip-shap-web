import Link from "next/link";
import {
  AdminCard,
  AdminPageHeader,
  AdminPill,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminProductThumb } from "@/components/admin/AdminProductThumb";
import {
  AdminStatusBadge,
  formatAvailabilityLabel,
  formatStockSummary,
} from "@/components/admin/AdminStatusBadge";
import { ProductModal } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { formatDemoPrice } from "@/domain/catalogue";
import type { DemoProduct } from "@/domain/catalogue";
import {
  adminListBrandsDurable,
  adminListCategoriesDurable,
  adminListProductsDurable,
} from "@/lib/admin/catalogue-durable";
import { impliedDiscountPercent } from "@/lib/admin/discount";
import {
  buildAdminPageHref,
  paginateItems,
  parseAdminPage,
} from "@/lib/admin/pagination";
import {
  filterProducts,
  parseProductSort,
  PRODUCT_FILTERS,
  sortProducts,
  type ProductSortKey,
  type SortDirection,
} from "@/lib/admin/products-query";
import {
  BulkActionBar,
  BulkRowCheckbox,
  BulkSelectAll,
} from "@/components/admin/BulkSelect";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

/** Column title that sorts the list when clicked; clicking again reverses it. */
function SortHeader({
  label,
  sortKey,
  active,
  query,
}: {
  label: string;
  sortKey: ProductSortKey;
  active: { key: ProductSortKey; dir: SortDirection };
  query: Record<string, string | undefined>;
}) {
  const isActive = active.key === sortKey;
  const nextDir: SortDirection = isActive && active.dir === "asc" ? "desc" : "asc";
  const href = buildAdminPageHref(
    "/admin/products",
    { ...query, sort: sortKey, dir: nextDir },
    1,
  );
  return (
    <AdminTh
      aria-sort={
        isActive ? (active.dir === "asc" ? "ascending" : "descending") : undefined
      }
    >
      <Link href={href} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
        {label}
        <span aria-hidden="true">{isActive ? (active.dir === "asc" ? "↑" : "↓") : ""}</span>
      </Link>
    </AdminTh>
  );
}

function PriceCell({ product }: { product: DemoProduct }) {
  const percent = impliedDiscountPercent(
    product.price.amount,
    product.compareAtPrice?.amount,
  );
  return (
    <div className="tabular">
      <p className="font-medium">{formatDemoPrice(product.price)}</p>
      {product.compareAtPrice ? (
        <p className="text-xs text-ink-muted">
          <span className="line-through">
            {formatDemoPrice(product.compareAtPrice)}
          </span>{" "}
          <span className="font-semibold text-brand-burnt-orange">
            −{percent}%
          </span>
        </p>
      ) : null}
    </div>
  );
}

function ProductNotes({ product }: { product: DemoProduct }) {
  return (
    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
      {product.brandName ? <span>{product.brandName}</span> : null}
      {product.isFeatured ? <AdminPill tone="good">Featured</AdminPill> : null}
      {product.isProvisional ? (
        <AdminPill tone="warn">Needs review</AdminPill>
      ) : null}
    </p>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    dir?: string;
    add?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const statusFilter = (params.status ?? "").trim();
  const sort = parseProductSort(params.sort, params.dir);

  const [allProducts, categories, brands, session] = await Promise.all([
    adminListProductsDurable(),
    adminListCategoriesDurable(),
    adminListBrandsDurable(),
    getAdminSession(),
  ]);
  const canEditPrice = session
    ? roleHasPermission(session.role, "products:price")
    : false;

  const products = sortProducts(
    filterProducts(allProducts, { status: statusFilter, q }),
    sort.key,
    sort.dir,
  );

  const archivedCount = allProducts.filter(
    (product) => product.status === "archived",
  ).length;
  const pageResult = paginateItems(products, parseAdminPage(params.page));
  const query = {
    q: params.q,
    status: params.status,
    sort: params.sort,
    dir: params.dir,
  };
  const filtered = !!q || !!statusFilter;

  const modalProps = {
    categories: categories.map(({ slug, name }) => ({ slug, name })),
    brands: brands.map(({ slug, name }) => ({ slug, name })),
    canEditPrice,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Find, add and edit the products in your shop."
        actions={
          <>
            <Button href="/admin/export/products" variant="ghost" size="sm">
              Download (CSV)
            </Button>
            {session && roleHasPermission(session.role, "import:run") ? (
              <Button href="/admin/import" variant="ghost" size="sm">
                Import from spreadsheet
              </Button>
            ) : null}
            <ProductModal {...modalProps} defaultOpen={params.add === "1"} />
          </>
        }
      />

      <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label className="sr-only" htmlFor="admin-product-q">
            Search products
          </label>
          <Input
            id="admin-product-q"
            name="q"
            defaultValue={params.q}
            placeholder="Search by name, brand, SKU or barcode"
            pill
          />
        </div>
        <div className="w-full sm:w-56">
          <label className="sr-only" htmlFor="admin-product-status">
            Show
          </label>
          <Select
            id="admin-product-status"
            name="status"
            defaultValue={statusFilter}
          >
            {PRODUCT_FILTERS.map((option) => (
              <option key={option.value || "active"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="ghost" size="md">
          Apply
        </Button>
        {filtered ? (
          <Button href="/admin/products" variant="link" size="sm">
            Clear
          </Button>
        ) : null}
      </form>

      {statusFilter !== "archived" && statusFilter !== "all" && archivedCount > 0 ? (
        <p className="text-sm text-ink-muted">
          {archivedCount} archived {archivedCount === 1 ? "product is" : "products are"} hidden.{" "}
          <Link
            href="/admin/products?status=archived"
            className="font-semibold text-brand-charcoal underline underline-offset-4"
          >
            Show archived
          </Link>
        </p>
      ) : null}

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            {filtered
              ? "No products match these filters."
              : "No products yet. Add one, or import a spreadsheet."}
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            mobile={pageResult.items.map((product) => (
              <AdminCard key={product.id}>
                <div className="flex gap-3">
                  <AdminProductThumb product={product} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-semibold underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <ProductNotes product={product} />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AdminStatusBadge status={product.status} />
                      <span className="text-xs text-ink-muted">
                        {formatAvailabilityLabel(product.availability)} ·{" "}
                        {formatStockSummary(
                          product.availability,
                          product.stockQuantity,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <PriceCell product={product} />
                  <ProductModal
                    {...modalProps}
                    product={product}
                    triggerLabel="Edit"
                  />
                </div>
              </AdminCard>
            ))}
          >
            <thead>
              <tr>
                <AdminTh className="w-8">
                  <BulkSelectAll />
                </AdminTh>
                <AdminTh className="w-14">
                  <span className="sr-only">Image</span>
                </AdminTh>
                <SortHeader label="Product" sortKey="name" active={sort} query={query} />
                <SortHeader label="Status" sortKey="status" active={sort} query={query} />
                <SortHeader label="Stock" sortKey="stock" active={sort} query={query} />
                <SortHeader label="Price" sortKey="price" active={sort} query={query} />
                <AdminTh>
                  <span className="sr-only">Actions</span>
                </AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((product) => (
                <tr key={product.id}>
                  <AdminTd>
                    <BulkRowCheckbox id={product.id} name={product.name} />
                  </AdminTd>
                  <AdminTd>
                    <AdminProductThumb product={product} />
                  </AdminTd>
                  <AdminTd>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <ProductNotes product={product} />
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusBadge status={product.status} />
                  </AdminTd>
                  <AdminTd>
                    <p className="tabular">
                      {formatStockSummary(
                        product.availability,
                        product.stockQuantity,
                      )}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {formatAvailabilityLabel(product.availability)}
                    </p>
                  </AdminTd>
                  <AdminTd>
                    <PriceCell product={product} />
                  </AdminTd>
                  <AdminTd className="text-right">
                    <ProductModal
                      {...modalProps}
                      product={product}
                      triggerLabel="Edit"
                    />
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          <BulkActionBar />
          <AdminPagination
            pathname="/admin/products"
            searchParams={query}
            result={pageResult}
            label="products"
          />
        </>
      )}
    </div>
  );
}
