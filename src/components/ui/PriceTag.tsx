import { formatDemoPrice } from "@/domain/catalogue";
import type { MoneyRwf } from "@/lib/money";
import { Badge } from "@/components/ui/Badge";

/** Whole-number percent off, never below 1 when a discount exists. */
export function discountPercent(price: MoneyRwf, compareAt: MoneyRwf): number {
  if (compareAt.amount <= price.amount) return 0;
  return Math.max(
    1,
    Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100),
  );
}

/** Formats integer RWF with tabular numerals. Shows the regular price struck through when discounted. */
export function PriceTag({
  price,
  compareAt,
  from = false,
  size = "md",
  className = "",
}: {
  price: MoneyRwf;
  /** Regular price while a discount is active. */
  compareAt?: MoneyRwf;
  from?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const onSale = !!compareAt && compareAt.amount > price.amount;
  const percent = onSale ? discountPercent(price, compareAt) : 0;

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
      {onSale && compareAt ? (
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
