import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/admin/PrintButton";
import { Button } from "@/components/ui/Button";
import { formatDemoPrice } from "@/domain/catalogue";
import { formatAdminDateTime } from "@/lib/admin/format";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";
import { LEGAL_NAME } from "@/lib/brand";
import { getOrderByIdDurable } from "@/lib/orders/durable";

export const metadata = { title: "Print order" };

/**
 * Printable order sheet. Opens without the admin menu so it prints cleanly: the same page works
 * as an invoice (prices) and as a packing slip (tick-boxes next to each item).
 */
export default async function PrintOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roleHasPermission(session.role, "orders:manage")) redirect("/admin");

  const { id } = await params;
  const order = await getOrderByIdDurable(id);
  if (!order) notFound();

  const address = [
    order.deliveryVillage,
    order.deliveryCell,
    order.deliverySector,
    order.deliveryDistrict,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="mx-auto max-w-3xl bg-white px-6 py-8 text-brand-charcoal print:max-w-none print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button href={`/admin/orders/${order.id}`} variant="ghost" size="sm">
          Back to order
        </Button>
        <PrintButton label="Print invoice / packing slip" />
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-brand-charcoal pb-4">
        <div>
          <h1 className="font-display text-2xl">{LEGAL_NAME}</h1>
          <p className="mt-1 text-sm">Order {order.reference}</p>
        </div>
        <p className="text-sm tabular">
          Placed {formatAdminDateTime(order.createdAt)}
        </p>
      </header>

      <section className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold tracking-[0.12em] uppercase">
            Customer
          </h2>
          <p className="mt-1 font-medium">{order.customerName}</p>
          <p>{order.customerPhone}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-[0.12em] uppercase">
            Deliver to
          </h2>
          <p className="mt-1">{address || "To be confirmed"}</p>
          {order.deliveryDirections ? <p>{order.deliveryDirections}</p> : null}
        </div>
      </section>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-brand-charcoal text-left">
            <th className="w-8 py-2" scope="col">
              <span className="sr-only">Packed</span>
            </th>
            <th className="py-2" scope="col">
              Item
            </th>
            <th className="py-2 text-right" scope="col">
              Qty
            </th>
            <th className="py-2 text-right" scope="col">
              Price
            </th>
            <th className="py-2 text-right" scope="col">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr
              key={`${item.productId}-${item.productSlug}`}
              className="border-b border-brand-charcoal/20"
            >
              <td className="py-2">
                <span
                  aria-hidden="true"
                  className="inline-block size-4 border-2 border-brand-charcoal"
                />
              </td>
              <td className="py-2">{item.productName}</td>
              <td className="py-2 text-right tabular">{item.quantity}</td>
              <td className="py-2 text-right tabular">
                {formatDemoPrice(item.unitPrice)}
              </td>
              <td className="py-2 text-right tabular">
                {formatDemoPrice(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="pt-3 text-right font-semibold">
              Total
            </td>
            <td className="pt-3 text-right font-semibold tabular">
              {formatDemoPrice(order.total)}
            </td>
          </tr>
          <tr>
            <td colSpan={4} className="pt-1 text-right">
              Received
            </td>
            <td className="pt-1 text-right tabular">
              {order.amountPaid ? formatDemoPrice(order.amountPaid) : "—"}
            </td>
          </tr>
        </tfoot>
      </table>

      {order.customerNotes ? (
        <p className="mt-6 text-sm">
          <span className="font-semibold">Customer note: </span>
          {order.customerNotes}
        </p>
      ) : null}
    </main>
  );
}
