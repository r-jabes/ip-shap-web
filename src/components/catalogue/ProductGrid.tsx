import type { DemoProduct } from "@/domain/catalogue";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export function ProductGrid({ products }: { products: DemoProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius-panel)] border-2 border-dashed border-brand-charcoal/30 px-6 py-16 text-center">
        <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">
          No matches
        </p>
        <h2 className="font-display mt-2 text-2xl">
          No drinks match these filters
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          Clear the filters or browse another range — the full catalogue is a
          tap away.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/shop" variant="primary" size="md">
            Clear filters
          </Button>
          <Button href="/shop?category=whisky" variant="ghost" size="md">
            Browse whisky
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4 lg:gap-x-6"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/5] w-full rounded-[var(--radius-frame)]" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </li>
      ))}
    </ul>
  );
}
