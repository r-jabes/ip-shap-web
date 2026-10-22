import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { formatAvailabilityLabel } from "@/components/admin/AdminStatusBadge";
import { StockModal } from "@/components/admin/StockModal";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { formatAdminDateTime } from "@/lib/admin/format";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";
import { listAdjustmentsDurable } from "@/lib/stock/durable";

function qty(value: number | null) {
  return value === null ? "—" : String(value);
}

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [products, adjustments] = await Promise.all([
    adminListProductsDurable(),
    listAdjustmentsDurable(500),
  ]);
  const names = new Map(products.map((product) => [product.id, product.name]));
  const pageResult = paginateItems(adjustments, parseAdminPage(params.page));

  const stockProducts = products
    .filter((product) => product.status !== "archived")
    .map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.stockQuantity ?? null,
      availability: product.availability,
    }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Stock"
        description="Update quantities and review the history of changes."
        actions={
          <StockModal products={stockProducts} defaultOpen={params.add === "1"} />
        }
      />

      <h2 className="font-display text-2xl">Stock history</h2>

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            No stock changes yet. Use “Update stock” to record the first one.
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            mobile={pageResult.items.map((row) => (
              <AdminCard key={row.id}>
                <p className="font-semibold">
                  {names.get(row.productId) ?? "A product"}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {formatAdminDateTime(row.createdAt)} · {row.actorEmail}
                </p>
                <p className="mt-2 text-sm tabular">
                  {qty(row.previousQuantity)} → {qty(row.newQuantity)} ·{" "}
                  {formatAvailabilityLabel(row.newAvailability)}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{row.reason}</p>
              </AdminCard>
            ))}
          >
            <thead>
              <tr>
                <AdminTh>When</AdminTh>
                <AdminTh>Product</AdminTh>
                <AdminTh>By</AdminTh>
                <AdminTh>Quantity</AdminTh>
                <AdminTh>Availability</AdminTh>
                <AdminTh>Reason</AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((row) => (
                <tr key={row.id}>
                  <AdminTd className="whitespace-nowrap tabular">
                    {formatAdminDateTime(row.createdAt)}
                  </AdminTd>
                  <AdminTd className="font-medium">
                    {names.get(row.productId) ?? "A product"}
                  </AdminTd>
                  <AdminTd>{row.actorEmail}</AdminTd>
                  <AdminTd className="whitespace-nowrap tabular">
                    {qty(row.previousQuantity)} → {qty(row.newQuantity)}
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap">
                    {formatAvailabilityLabel(row.previousAvailability)} →{" "}
                    {formatAvailabilityLabel(row.newAvailability)}
                  </AdminTd>
                  <AdminTd>{row.reason}</AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          <AdminPagination
            pathname="/admin/stock"
            searchParams={{}}
            result={pageResult}
            label="changes"
          />
        </>
      )}
    </div>
  );
}
