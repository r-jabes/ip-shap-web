"use client";

import type { DemoProduct } from "@/domain/catalogue";
import { useCart, useLiveProduct } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { StockNote } from "@/components/ui/StockNote";
import { describeStock } from "@/lib/stock/storefront";

/** Thumb-reach add-to-cart strip above the mobile bottom bar. */
export function ProductStickyBar({
  product: catalogueProduct,
}: {
  product: DemoProduct;
}) {
  const { addItem, lines } = useCart();
  const product = useLiveProduct(catalogueProduct);
  const stock = describeStock(product);
  const inCart =
    lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  const outOfStock = stock.max === 0;
  const allInCart = !outOfStock && inCart >= stock.max;

  return (
    <div className="fixed inset-x-0 bottom-[var(--bottom-bar-h)] z-30 border-t-2 border-brand-charcoal bg-brand-warm-white/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-charcoal">
            {product.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-3">
            <PriceTag
              price={product.price}
              compareAt={product.compareAtPrice}
              size="sm"
            />
            <StockNote stock={stock} />
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={outOfStock || allInCart}
          onClick={() => addItem(product.id, 1)}
        >
          {outOfStock ? "Out of stock" : allInCart ? "In cart" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
