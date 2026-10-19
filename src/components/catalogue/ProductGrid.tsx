import type { DemoProduct } from "@/domain/catalogue";
import { ProductCard } from "@/components/catalogue/ProductCard";

export function ProductGrid({ products }: { products: DemoProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-brand-dark-neutral/30 px-6 py-16 text-center">
        <h2 className="font-display text-2xl">No drinks match these filters</h2>
        <p className="mt-2 text-brand-dark-neutral">
          Clear the filters or browse another range.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
