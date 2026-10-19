"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IconButton } from "@/components/ui/IconButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TrashIcon } from "@/components/ui/icons";
import { formatDemoPrice } from "@/domain/catalogue";
import { primaryCatalogueImage } from "@/lib/product-image";

export default function CartPage() {
  const { items, subtotal, hydrated, setQuantity, removeItem, clearCart } =
    useCart();

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="font-display" style={{ fontSize: "var(--type-display)" }}>
        Your cart
      </h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Review your drinks. Prices are confirmed again when you check out.
      </p>

      {!hydrated ? (
        <p className="mt-12 text-ink-muted">Loading your cart…</p>
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-[var(--radius-panel)] border-2 border-dashed border-line-strong px-6 py-20 text-center">
          <p className="font-display text-3xl">Your cart is empty</p>
          <p className="mt-2 text-ink-muted">
            Find something you like and add it to your cart.
          </p>
          <Button href="/shop" className="mt-8">
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_0.8fr] lg:items-start">
          <ul className="divide-y divide-line">
            {items.map(({ product, quantity }) => {
              const image = primaryCatalogueImage(product.images);
              return (
                <li key={product.id} className="flex gap-5 py-6 first:pt-0">
                  <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-[var(--radius-frame)] bg-paper-2">
                    {image ? (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
                      {product.brandName}
                    </p>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-display mt-1 text-xl underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-ink-muted tabular">
                      {formatDemoPrice(product.price)} each
                    </p>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <QuantityStepper
                        value={quantity}
                        label={`Quantity of ${product.name}`}
                        onChange={(next) => setQuantity(product.id, next)}
                      />
                      <p className="font-semibold tabular">
                        {formatDemoPrice({
                          amount: product.price.amount * quantity,
                          currency: "RWF",
                        })}
                      </p>
                      <IconButton
                        label={`Remove ${product.name}`}
                        onClick={() => removeItem(product.id)}
                      >
                        <TrashIcon size={18} />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="mt-5 flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold tabular">
                {formatDemoPrice({ amount: subtotal, currency: "RWF" })}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              Delivery is confirmed with you after you place the order.
            </p>
            <Button href="/checkout" size="lg" className="mt-6 w-full">
              Proceed to checkout
            </Button>
            <Button variant="link" className="mt-3 w-full" onClick={clearCart}>
              Clear cart
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
}
