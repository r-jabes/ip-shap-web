import type { ProductAvailability } from "@/domain/catalogue";
import type { ProductStatus } from "@/domain/product";

const STATUS_STYLES: Record<ProductStatus, string> = {
  draft: "border-brand-charcoal/25 bg-paper-2 text-brand-charcoal",
  demo: "border-brand-charcoal/25 bg-white text-ink-muted",
  published:
    "border-brand-burnt-orange/50 bg-brand-burnt-orange/15 text-brand-charcoal",
  archived: "border-brand-charcoal/20 bg-brand-charcoal/5 text-ink-muted",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  demo: "Demo",
  published: "Published",
  archived: "Archived",
};

const AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  unknown: "Unknown",
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function AdminStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${STATUS_STYLES[status] ?? STATUS_STYLES.draft}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function formatAvailabilityLabel(
  availability: ProductAvailability,
): string {
  return AVAILABILITY_LABELS[availability] ?? availability;
}

export function formatStockSummary(
  availability: ProductAvailability,
  quantity: number | null | undefined,
): string {
  if (quantity === null || quantity === undefined) {
    return availability === "unknown" ? "Unknown" : "Qty unknown";
  }
  return String(quantity);
}
