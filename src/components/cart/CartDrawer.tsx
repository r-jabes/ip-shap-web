"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { formatDemoPrice } from "@/domain/catalogue";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { getProductById } from "@/lib/catalogue";
import { primaryCatalogueImage } from "@/lib/product-image";

export function CartDrawer() {
  const {
    lines,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    itemCount,
    feedback,
  } = useCart();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const populated = lines
    .map((line) => {
      const product = getProductById(line.productId);
      if (!product) return null;
      return { line, product };
    })
    .filter(Boolean) as Array<{
    line: (typeof lines)[number];
    product: NonNullable<ReturnType<typeof getProductById>>;
  }>;

  const subtotal = populated.reduce(
    (sum, entry) => sum + entry.product.price.amount * entry.line.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="drawer-backdrop absolute inset-0 bg-brand-charcoal/50"
        aria-label="Close cart"
        onClick={closeCart}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="drawer-panel relative flex h-full w-full max-w-md flex-col bg-brand-warm-white text-brand-charcoal shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-brand-dark-neutral/15 px-5 py-4">
          <h2 id={titleId} className="font-display text-2xl">
            Cart ({itemCount})
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="text-sm underline-offset-4 transition-opacity duration-[var(--motion-fast)] hover:underline"
          >
            Close
          </button>
        </div>
        {feedback ? (
          <p
            className="border-b border-brand-dark-neutral/10 bg-brand-warm-white px-5 py-2 text-sm text-brand-dark-neutral"
            role="status"
          >
            {feedback}
          </p>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {populated.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-xl">Your cart is empty</p>
              <p className="mt-2 text-sm text-brand-dark-neutral">
                Add drinks from the shop to continue to checkout.
              </p>
              <Button href="/shop" className="mt-6" onClick={closeCart}>
                Shop drinks
              </Button>
            </div>
          ) : (
            <ul className="space-y-5">
              {populated.map(({ line, product }) => {
                const image = primaryCatalogueImage(product.images);
                return (
                  <li key={product.id} className="flex gap-3">
                    <div className="relative h-24 w-20 shrink-0 bg-[#E8E2D6]">
                      {image ? (
                        <Image
                          src={image.src}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={closeCart}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-brand-dark-neutral">
                        {formatDemoPrice(product.price)} · demo
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <label
                          className="sr-only"
                          htmlFor={`qty-${product.id}`}
                        >
                          Quantity for {product.name}
                        </label>
                        <input
                          id={`qty-${product.id}`}
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(event) =>
                            setQuantity(
                              product.id,
                              Number.parseInt(event.target.value, 10) || 1,
                            )
                          }
                          className="w-16 border border-brand-dark-neutral/30 bg-transparent px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          className="text-xs underline"
                          onClick={() => removeItem(product.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {populated.length > 0 ? (
          <div className="border-t border-brand-dark-neutral/15 px-5 py-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal (demo)</span>
              <span className="font-medium">
                {formatDemoPrice({ amount: subtotal, currency: "RWF" })}
              </span>
            </div>
            <p className="mt-2 text-xs text-brand-dark-neutral">
              Checkout recalculates prices server-side and creates the order
              before any WhatsApp hand-off.
            </p>
            <Button
              href="/checkout"
              className="mt-4 w-full"
              onClick={closeCart}
            >
              Checkout
            </Button>
            <Button
              href="/cart"
              variant="ghost"
              className="mt-2 w-full"
              onClick={closeCart}
            >
              View cart page
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
