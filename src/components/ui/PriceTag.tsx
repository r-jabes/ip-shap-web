import { formatDemoPrice } from "@/domain/catalogue";
import type { MoneyRwf } from "@/lib/money";
import {
  sampleCompareAtPrice,
  sampleDiscountPercent,
} from "@/lib/sample-pricing";
import { Badge } from "@/components/ui/Badge";

/** Formats integer RWF with tabular numerals. Supports sample sale presentation. */
export function PriceTag({
  price,
  from = false,
  size = "md",
  className = "",
  /** When true, may show a sample compare-at / % off for design review. */
  showSampleSale = false,
}: {
  price: MoneyRwf;
  from?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showSampleSale?: boolean;
}) {
  const compareAt = showSampleSale ? sampleCompareAtPrice(price) : undefined;
  const onSale = !!compareAt && compareAt.amount > price.amount;
  const percent = onSale ? sampleDiscountPercent(price, compareAt) : 0;

  const priceSize =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  const wasSize =
    size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}
    >
      {from ? (
        <span className="text-[0.7em] font-medium tracking-[0.08em] text-ink-muted uppercase">
          From
        </span>
      ) : null}
      <span
        className={`font-display font-semibold tabular text-brand-burnt-orange ${priceSize}`}
      >
        {formatDemoPrice(price)}
      </span>
      {onSale ? (
        <>
          <span
            className={`tabular text-ink-muted line-through decoration-brand-charcoal/50 ${wasSize}`}
          >
            {formatDemoPrice(compareAt)}
          </span>
          <Badge tone="accent" className="translate-y-[-1px]">
            −{percent}%
          </Badge>
        </>
      ) : null}
    </span>
  );
}
