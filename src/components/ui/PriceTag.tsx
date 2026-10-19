import { formatDemoPrice } from "@/domain/catalogue";
import type { MoneyRwf } from "@/lib/money";

/** Formats integer RWF with tabular numerals. `from` prefixes "From". */
export function PriceTag({
  price,
  from = false,
  size = "md",
  className = "",
}: {
  price: MoneyRwf;
  from?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl" } as const;
  return (
    <span className={`font-semibold tabular ${sizes[size]} ${className}`}>
      {from ? (
        <span className="mr-1.5 text-[0.7em] font-medium tracking-[0.08em] text-ink-muted uppercase">
          From
        </span>
      ) : null}
      {formatDemoPrice(price)}
    </span>
  );
}
