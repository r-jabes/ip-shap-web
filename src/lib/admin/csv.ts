import type { DemoProduct } from "@/domain/catalogue";
import { kigaliDay } from "@/lib/admin/reports";
import type { StoredOrder } from "@/lib/orders/store";

export type CsvCell = string | number | null | undefined;

/**
 * Quotes a cell for CSV. Cells that begin with `= + - @` (or a tab/carriage return) are prefixed
 * with an apostrophe so Excel and Sheets show them as text instead of running them as formulas —
 * a customer could otherwise type `=HYPERLINK(...)` into their name and attack whoever opens the file.
 */
export function csvCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV text with a byte-order mark so Excel reads accented names correctly. */
export function toCsv(header: string[], rows: CsvCell[][]): string {
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(","));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export function ordersToCsv(orders: StoredOrder[]): string {
  return toCsv(
    [
      "Reference",
      "Placed (Kigali date)",
      "Customer",
      "Phone",
      "Status",
      "Payment",
      "Items",
      "Total (RWF)",
      "Amount received (RWF)",
      "District",
      "Sector",
      "Notes",
    ],
    orders.map((order) => [
      order.reference,
      kigaliDay(order.createdAt),
      order.customerName,
      order.customerPhone,
      order.fulfilmentStatus,
      order.paymentStatus,
      order.items.map((item) => `${item.quantity} x ${item.productName}`).join("; "),
      order.total.amount,
      order.amountPaid?.amount ?? "",
      order.deliveryDistrict,
      order.deliverySector,
      order.customerNotes,
    ]),
  );
}

export function productsToCsv(products: DemoProduct[]): string {
  return toCsv(
    [
      "Name",
      "Brand",
      "Category",
      "Price (RWF)",
      "Status",
      "Availability",
      "Quantity",
      "SKU",
      "Barcode",
    ],
    products.map((product) => [
      product.name,
      product.brandName,
      product.categorySlug,
      product.price.amount,
      product.status,
      product.availability,
      product.stockQuantity ?? "",
      product.sku,
      product.barcode,
    ]),
  );
}
