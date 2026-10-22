import {
  AdminPageHeader,
  AdminPanel,
  AdminStatus,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { adjustStockAction } from "@/app/admin/actions";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";
import { listAdjustmentsDurable } from "@/lib/stock/durable";

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<{ adjusted?: string; page?: string }>;
}) {
  const params = await searchParams;
  const products = await adminListProductsDurable();
  const adjustments = await listAdjustmentsDurable(500);
  const pageResult = paginateItems(adjustments, parseAdminPage(params.page));
  const query = {
    adjusted: params.adjusted,
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Stock"
        description="Update quantities and review recent adjustments."
      />

      {params.adjusted ? <AdminStatus>Stock adjusted.</AdminStatus> : null}

      <AdminPanel className="max-w-xl">
        <form action={adjustStockAction} className="grid gap-4">
          <Field id="stock-product" label="Product">
            <Select id="stock-product" name="productId" required>
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
            </Select>
          </Field>
          <Field
            id="stock-expected"
            label="Expected quantity (optional)"
            hint="Leave blank unless you want to confirm the current quantity first."
          >
            <Input
              id="stock-expected"
              name="expectedQuantity"
              placeholder="Current quantity"
            />
          </Field>
          <Field id="stock-availability" label="New availability">
            <Select
              id="stock-availability"
              name="newAvailability"
              defaultValue="unknown"
            >
              <option value="unknown">Unknown</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </Select>
          </Field>
          <Field
            id="stock-qty"
            label="New quantity"
            hint="Leave empty if quantity is unknown."
          >
            <Input id="stock-qty" name="newQuantity" inputMode="numeric" />
          </Field>
          <Field id="stock-reason" label="Reason">
            <Input id="stock-reason" name="reason" required maxLength={500} />
          </Field>
          <Button type="submit" variant="primary" size="md" className="w-fit">
            Record adjustment
          </Button>
        </form>
      </AdminPanel>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Adjustment log</h2>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>When</AdminTh>
              <AdminTh>Actor</AdminTh>
              <AdminTh>Qty</AdminTh>
              <AdminTh>Availability</AdminTh>
              <AdminTh>Reason</AdminTh>
            </tr>
          </thead>
          <tbody>
            {pageResult.items.map((row) => (
              <tr key={row.id}>
                <AdminTd className="whitespace-nowrap tabular">
                  {row.createdAt}
                </AdminTd>
                <AdminTd>{row.actorEmail}</AdminTd>
                <AdminTd className="tabular">
                  {row.previousQuantity} → {row.newQuantity}
                </AdminTd>
                <AdminTd>
                  {row.previousAvailability} → {row.newAvailability}
                </AdminTd>
                <AdminTd>{row.reason}</AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
        {pageResult.total === 0 ? (
          <p className="text-sm text-ink-muted">No adjustments yet.</p>
        ) : (
          <AdminPagination
            pathname="/admin/stock"
            searchParams={query}
            result={pageResult}
            label="adjustments"
          />
        )}
      </section>
    </div>
  );
}
