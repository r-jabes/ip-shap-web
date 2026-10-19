import Link from "next/link";
import { adminListProducts } from "@/lib/admin/store";
import { formatDemoPrice } from "@/domain/catalogue";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  let products = adminListProducts();
  if (q) {
    products = products.filter((product) =>
      `${product.name} ${product.slug} ${product.brandName}`
        .toLowerCase()
        .includes(q),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-2 text-sm text-brand-dark-neutral">
            Create, edit, publish and archive. Server actions enforce roles.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white"
        >
          New product
        </Link>
      </div>

      {params.archived ? (
        <p className="text-sm text-brand-dark-neutral" role="status">
          Product archived.
        </p>
      ) : null}

      <form className="flex gap-2">
        <label className="sr-only" htmlFor="admin-product-q">
          Search products
        </label>
        <input
          id="admin-product-q"
          name="q"
          defaultValue={params.q}
          placeholder="Search name, slug, brand"
          className="w-full max-w-md border border-brand-dark-neutral/30 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="border border-brand-charcoal px-4 py-2 text-sm"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-dark-neutral/20 text-xs tracking-[0.08em] uppercase">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Availability</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-brand-dark-neutral/10"
              >
                <td className="py-3 pr-4">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-brand-dark-neutral">
                    {product.slug}
                  </p>
                </td>
                <td className="py-3 pr-4">{product.status}</td>
                <td className="py-3 pr-4">{product.availability}</td>
                <td className="py-3 pr-4">
                  {product.stockQuantity === null ||
                  product.stockQuantity === undefined
                    ? "—"
                    : product.stockQuantity}
                </td>
                <td className="py-3 pr-4">{formatDemoPrice(product.price)}</td>
                <td className="py-3">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="underline underline-offset-4"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 ? (
          <p className="mt-6 text-sm text-brand-dark-neutral">
            No products found.
          </p>
        ) : null}
      </div>
    </div>
  );
}
