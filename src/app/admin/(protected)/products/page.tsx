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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { formatDemoPrice } from "@/domain/catalogue";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    archived?: string;
    saved?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  let products = await adminListProductsDurable();
  if (q) {
    products = products.filter((product) =>
      `${product.name} ${product.slug} ${product.brandName}`
        .toLowerCase()
        .includes(q),
    );
  }
  const pageResult = paginateItems(products, parseAdminPage(params.page));
  const query = {
    q: params.q,
    archived: params.archived,
    saved: params.saved,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Create, edit, and publish catalogue products."
        actions={
          <Button href="/admin/products/new" variant="primary" size="sm">
            New product
          </Button>
        }
      />

      {params.archived ? <AdminStatus>Product archived.</AdminStatus> : null}

      <form className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="admin-product-q">
          Search products
        </label>
        <Input
          id="admin-product-q"
          name="q"
          defaultValue={params.q}
          placeholder="Search name, slug, brand"
          pill
          className="max-w-md"
        />
        <Button type="submit" variant="ghost" size="md">
          Search
        </Button>
      </form>

      <AdminTable>
        <thead>
          <tr>
            <AdminTh className="w-14">
              <span className="sr-only">Image</span>
            </AdminTh>
            <AdminTh>Name</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Featured</AdminTh>
            <AdminTh>Availability</AdminTh>
            <AdminTh>Stock</AdminTh>
            <AdminTh>Price</AdminTh>
            <AdminTh>Edit</AdminTh>
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
                <p className="text-xs text-ink-muted">{product.slug}</p>
              </AdminTd>
              <AdminTd>{product.status}</AdminTd>
              <AdminTd>
                {product.isFeatured
                  ? `Yes (#${product.featuredSort ?? 0})`
                  : "—"}
              </AdminTd>
              <AdminTd>{product.availability}</AdminTd>
              <AdminTd className="tabular">
                {product.stockQuantity === null ||
                product.stockQuantity === undefined
                  ? "—"
                  : product.stockQuantity}
              </AdminTd>
              <AdminTd className="tabular">
                {formatDemoPrice(product.price)}
              </AdminTd>
              <AdminTd>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-semibold underline decoration-2 underline-offset-4 decoration-brand-burnt-orange"
                >
                  Open
                </Link>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {pageResult.total === 0 ? (
        <p className="text-sm text-ink-muted">No products found.</p>
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
