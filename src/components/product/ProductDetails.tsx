"use client";

import { useId, useState } from "react";
import type { DemoProduct } from "@/domain/catalogue";

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
      <dl className="space-y-2.5 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
          >
            <dt className="font-semibold text-brand-charcoal">{row.label}</dt>
            <dd className="min-w-0 text-ink-muted">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Accordion>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border-t-2 border-brand-charcoal/15">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="font-display text-lg">{title}</span>
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="pb-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
