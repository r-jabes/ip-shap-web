import Link from "next/link";
import {
  AdminPageHeader,
  AdminStatus,
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
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { formatDemoPrice } from "@/domain/catalogue";
import type { ProductStatus } from "@/domain/product";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
  { value: "demo", label: "Demo" },
] as const;

function isProductStatus(value: string): value is ProductStatus {
  return ["draft", "demo", "published", "archived"].includes(value);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    archived?: string;
    saved?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const statusFilter = (params.status ?? "").trim();

  let products = await adminListProductsDurable();
  if (q) {
    products = products.filter((product) =>
      `${product.name} ${product.slug} ${product.brandName} ${product.sku ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }
  if (isProductStatus(statusFilter)) {
    products = products.filter((product) => product.status === statusFilter);
  }

  const pageResult = paginateItems(products, parseAdminPage(params.page));
  const query = {
    q: params.q,
    status: params.status,
    archived: params.archived,
    saved: params.saved,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Find, edit, and publish catalogue products."
        actions={
          <Button href="/admin/products/new" variant="primary" size="sm">
            New product
          </Button>
        }
      />

      {params.archived ? <AdminStatus>Product archived.</AdminStatus> : null}
      {params.saved ? <AdminStatus>Product saved.</AdminStatus> : null}

      <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label className="sr-only" htmlFor="admin-product-q">
            Search products
          </label>
          <Input
            id="admin-product-q"
            name="q"
            defaultValue={params.q}
            placeholder="Search name, slug, brand, or SKU"
            pill
          />
        </div>
        <div className="w-full sm:w-48">
          <label className="sr-only" htmlFor="admin-product-status">
            Filter by status
          </label>
          <Select
            id="admin-product-status"
            name="status"
            defaultValue={statusFilter}
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="ghost" size="md">
          Apply
        </Button>
        {q || statusFilter ? (
          <Button href="/admin/products" variant="link" size="sm">
            Clear
          </Button>
        ) : null}
      </form>

      <AdminTable>
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
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-ink-muted">
                  {product.brandName}
                  <span className="mx-1.5 text-brand-charcoal/30">·</span>
                  <span className="font-mono">{product.slug}</span>
                  {product.isFeatured ? (
                    <>
                      <span className="mx-1.5 text-brand-charcoal/30">·</span>
                      Featured #{product.featuredSort ?? 0}
                    </>
                  ) : null}
                  {product.isProvisional ? (
                    <>
                      <span className="mx-1.5 text-brand-charcoal/30">·</span>
                      Provisional
                    </>
                  ) : null}
                </p>
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
              <AdminTd className="tabular">
                {formatDemoPrice(product.price)}
              </AdminTd>
              <AdminTd>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="inline-flex h-9 items-center rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-3.5 text-sm font-semibold shadow-[2px_2px_0_0_var(--brand-charcoal)]"
                >
                  Edit
                </Link>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            {q || statusFilter
              ? "No products match these filters."
              : "No products yet."}
          </p>
          {!q && !statusFilter ? (
            <div className="mt-4">
              <Button href="/admin/products/new" variant="primary" size="sm">
                Create first product
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <AdminPagination
          pathname="/admin/products"
          searchParams={query}
          result={pageResult}
          label="products"
        />
      )}
    </div>
  );
}
