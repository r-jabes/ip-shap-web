import type { DemoProduct } from "@/domain/catalogue";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { Button } from "@/components/ui/Button";

export function ProductRelated({
  products,
  categoryName,
  categorySlug,
}: {
  products: DemoProduct[];
  categoryName?: string;
  categorySlug?: string;
}) {
  if (products.length === 0) return null;

  const allSameRange =
    !!categorySlug &&
    products.every((product) => product.categorySlug === categorySlug);

  return (
    <section className="mt-14 border-t-2 border-brand-charcoal/15 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">
            Related
          </p>
          <h2 className="font-display mt-1 text-2xl">
            {allSameRange && categoryName
              ? `More in ${categoryName}`
              : "You may also like"}
          </h2>
        </div>
        {categorySlug ? (
          <Button
            href={`/shop?category=${categorySlug}`}
            variant="ghost"
            size="sm"
          >
            View range
          </Button>
        ) : null}
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-6">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
