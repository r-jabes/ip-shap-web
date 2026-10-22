"use client";

import type { DemoProduct } from "@/domain/catalogue";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";

/** Thumb-reach add-to-cart strip above the mobile bottom bar. */
export function ProductStickyBar({ product }: { product: DemoProduct }) {
  const { addItem } = useCart();
  const unavailable = product.availability === "out_of_stock";

  return (
    <div className="fixed inset-x-0 bottom-[var(--bottom-bar-h)] z-30 border-t-2 border-brand-charcoal bg-brand-warm-white/95 px-3 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-charcoal">
            {product.name}
          </p>
          <PriceTag
            price={product.price}
            compareAt={product.compareAtPrice}
            size="sm"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={unavailable}
          onClick={() => addItem(product.id, 1)}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
