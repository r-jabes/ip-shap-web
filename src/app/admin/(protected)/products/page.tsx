import Link from "next/link";
import {
  AdminPageHeader,
  AdminStatus,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { formatDemoPrice } from "@/domain/catalogue";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string; saved?: string }>;
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Create, edit, publish and archive. Writes go to Supabase when configured."
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
          {products.map((product) => (
            <tr key={product.id}>
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
      {products.length === 0 ? (
        <p className="text-sm text-ink-muted">No products found.</p>
      ) : null}
    </div>
  );
}
