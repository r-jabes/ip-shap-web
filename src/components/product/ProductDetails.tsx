"use client";

import type { DemoProduct } from "@/domain/catalogue";
import { Accordion } from "@/components/ui/Accordion";

type Row = { label: string; value: string };

export function ProductDetails({
  product,
  categoryName,
}: {
  product: DemoProduct;
  categoryName?: string;
}) {
  const rows: Row[] = [
    { label: "Brand", value: product.brandName },
    ...(categoryName ? [{ label: "Range", value: categoryName }] : []),
    ...(typeof product.stockQuantity === "number"
      ? [{ label: "Quantity on hand", value: String(product.stockQuantity) }]
      : []),
  ];

  if (rows.length === 0) return null;

  return (
    <Accordion title="Details" defaultOpen>
      <dl className="space-y-2.5 text-sm text-brand-charcoal">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
          >
            <dt className="font-semibold">{row.label}</dt>
            <dd className="min-w-0 text-ink-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Accordion>
  );
}
