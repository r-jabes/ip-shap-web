import type { StockInfo } from "@/lib/stock/storefront";

const TONE: Record<StockInfo["tone"], { text: string; dot: string }> = {
  out: { text: "text-red-700", dot: "bg-red-600" },
  low: { text: "text-amber-800", dot: "bg-amber-500" },
  in: { text: "text-emerald-700", dot: "bg-emerald-600" },
  untracked: { text: "text-ink-muted", dot: "bg-ink-muted" },
};

/** Small coloured stock status ("Out of stock", "Only 3 left", "19 in stock"). Renders nothing when there is no label. */
export function StockNote({
  stock,
  className = "",
}: {
  stock: StockInfo;
  className?: string;
}) {
  if (!stock.label) return null;
  const tone = TONE[stock.tone];
  return (
    <p
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${tone.text} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`}
      />
      {stock.label}
    </p>
  );
}
