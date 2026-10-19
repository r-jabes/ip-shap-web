import { adjustStockAction } from "@/app/admin/actions";
import { adminListAdjustments, adminListProducts } from "@/lib/admin/store";

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ adjusted?: string }>;
}) {
  const params = await searchParams;
  const products = adminListProducts();
  const adjustments = adminListAdjustments(25);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Stock control</h1>
        <p className="mt-2 text-sm text-brand-dark-neutral">
          Every adjustment records actor, previous/new values and reason.
          Negative stock is rejected. Unknown stock must not be treated as in
          stock.
        </p>
      </div>

      {params.adjusted ? (
        <p className="text-sm text-brand-dark-neutral" role="status">
          Stock adjusted.
        </p>
      ) : null}

      <form action={adjustStockAction} className="grid max-w-xl gap-3">
        <label className="grid gap-1 text-sm">
          Product
          <select
            name="productId"
            required
            className="border border-brand-dark-neutral/30 px-3 py-2"
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (
                {product.stockQuantity === null ||
                product.stockQuantity === undefined
                  ? "qty unknown"
                  : `qty ${product.stockQuantity}`}
                )
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Expected quantity (stale-write guard)
          <input
            name="expectedQuantity"
            placeholder="Leave blank to skip check"
            className="border border-brand-dark-neutral/30 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          New availability
          <select
            name="newAvailability"
            className="border border-brand-dark-neutral/30 px-3 py-2"
            defaultValue="unknown"
          >
            <option value="unknown">Unknown</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          New quantity (empty when unknown)
          <input
            name="newQuantity"
            inputMode="numeric"
            className="border border-brand-dark-neutral/30 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Reason
          <input
            name="reason"
            required
            maxLength={500}
            className="border border-brand-dark-neutral/30 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-fit bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white"
        >
          Record adjustment
        </button>
      </form>

      <section>
        <h2 className="font-display text-2xl">Adjustment log</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-dark-neutral/20 text-xs uppercase">
              <tr>
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">Availability</th>
                <th className="py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-brand-dark-neutral/10"
                >
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {row.createdAt}
                  </td>
                  <td className="py-2 pr-3">{row.actorEmail}</td>
                  <td className="py-2 pr-3">
                    {row.previousQuantity} → {row.newQuantity}
                  </td>
                  <td className="py-2 pr-3">
                    {row.previousAvailability} → {row.newAvailability}
                  </td>
                  <td className="py-2">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {adjustments.length === 0 ? (
            <p className="mt-4 text-sm text-brand-dark-neutral">
              No adjustments yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
