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
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

/** Archived products stay out of the list unless someone asks for them. */
const STATUS_FILTERS = [
  { value: "", label: "Active (hide archived)" },
  { value: "published", label: "Published only" },
  { value: "draft", label: "Drafts only" },
  { value: "archived", label: "Archived only" },
  { value: "all", label: "Everything" },
] as const;

function applyStatusFilter(products: DemoProduct[], filter: string) {
  switch (filter) {
    case "published":
      return products.filter((p) => p.status === "published");
    case "draft":
      return products.filter((p) => p.status === "draft" || p.status === "demo");
    case "archived":
      return products.filter((p) => p.status === "archived");
    case "all":
      return products;
    default:
      return products.filter((p) => p.status !== "archived");
  }
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
      <span>{product.brandName}</span>
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
    add?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const statusFilter = (params.status ?? "").trim();

  const [allProducts, categories, brands, session] = await Promise.all([
    adminListProductsDurable(),
    adminListCategoriesDurable(),
    adminListBrandsDurable(),
    getAdminSession(),
  ]);
  const canEditPrice = session
    ? roleHasPermission(session.role, "products:price")
    : false;

  let products = applyStatusFilter(allProducts, statusFilter);
  if (q) {
    products = products.filter((product) =>
      `${product.name} ${product.slug} ${product.brandName} ${product.sku ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }

  const archivedCount = allProducts.filter(
    (product) => product.status === "archived",
  ).length;
  const pageResult = paginateItems(products, parseAdminPage(params.page));
  const query = { q: params.q, status: params.status };
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
            <Button href="/admin/import" variant="ghost" size="sm">
              Import from spreadsheet
            </Button>
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
            placeholder="Search by name, brand or SKU"
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
            {STATUS_FILTERS.map((option) => (
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
                <AdminTh className="w-14">
                  <span className="sr-only">Image</span>
                </AdminTh>
                <AdminTh>Product</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Stock</AdminTh>
                <AdminTh>Price</AdminTh>
                <AdminTh>
                  <span className="sr-only">Actions</span>
                </AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((product) => (
                <tr key={product.id}>
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
