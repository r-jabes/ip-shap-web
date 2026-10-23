import type { ReactNode } from "react";
import type { DemoProduct } from "@/domain/catalogue";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function ProductGrid({
  products,
  emptyState,
}: {
  products: DemoProduct[];
  /** Shown when there is nothing to list (for example the no-results page on the shop). */
  emptyState?: ReactNode;
}) {
  if (products.length === 0) {
    return emptyState ?? null;
  }

  return (
    <ul className="content-settle grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6">
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
