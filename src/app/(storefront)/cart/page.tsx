"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { IconButton } from "@/components/ui/IconButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { BagIcon, TrashIcon } from "@/components/ui/icons";
import { formatDemoPrice } from "@/domain/catalogue";
import { primaryCatalogueImage } from "@/lib/product-image";

export default function CartPage() {
  const { items, subtotal, hydrated, setQuantity, removeItem, clearCart } =
    useCart();
  const count = items.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Container className="py-10 lg:py-14">
      <CheckoutSteps current="cart" />
      <h1
        className="font-display mt-6 text-brand-charcoal"
        style={{ fontSize: "var(--type-display)" }}
      >
        Your cart
      </h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Review your drinks, then check out. We confirm availability, delivery
        and payment with you after you place the order.
      </p>

      {!hydrated ? (
        <p className="mt-12 text-ink-muted">Loading your cart…</p>
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-[var(--radius-panel)] border-2 border-dashed border-brand-charcoal/25 bg-paper-2/40 px-6 py-16 text-center sm:py-20">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-charcoal bg-brand-warm-white shadow-[3px_3px_0_0_var(--brand-charcoal)]">
            <BagIcon size={32} />
          </span>
          <p className="font-display mt-8 text-3xl">Your cart is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-ink-muted">
            Find something you like and add it here, then check out on this
            site.
          </p>
          <Button href="/shop" className="mt-8">
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.75fr)] lg:items-start lg:gap-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
              {count} {count === 1 ? "item" : "items"}
            </p>
            <ul className="mt-4 divide-y-2 divide-brand-charcoal/10 border-y-2 border-brand-charcoal/10">
              {items.map(({ product, quantity }) => {
                const image = primaryCatalogueImage(product.images);
                return (
                  <li
                    key={product.id}
                    className="flex gap-4 py-6 sm:gap-5 first:pt-6"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="relative h-32 w-24 shrink-0 overflow-hidden rounded-[var(--radius-frame)] border-2 border-brand-charcoal bg-paper-2 shadow-[3px_3px_0_0_var(--brand-charcoal)] sm:h-36 sm:w-28"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {image ? (
                        <Image
                          src={image.src}
                          alt=""
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                            {product.brandName}
                          </p>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-display mt-1 block text-xl leading-tight text-brand-charcoal underline-offset-4 hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-sm text-ink-muted tabular">
                            {formatDemoPrice(product.price)} each
                          </p>
                        </div>
                        <IconButton
                          label={`Remove ${product.name}`}
                          size="sm"
                          onClick={() => removeItem(product.id)}
                        >
                          <TrashIcon size={18} />
                        </IconButton>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        <QuantityStepper
                          value={quantity}
                          label={`Quantity of ${product.name}`}
                          onChange={(next) => setQuantity(product.id, next)}
                        />
                        <p className="font-display text-xl tabular text-brand-burnt-orange">
                          {formatDemoPrice({
                            amount: product.price.amount * quantity,
                            currency: "RWF",
                          })}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-6 shadow-[6px_6px_0_0_var(--brand-charcoal)] lg:sticky lg:top-[calc(var(--header-h)+1.25rem)]">
            <h2 className="font-display text-2xl">Order summary</h2>
            <div className="mt-5 flex items-baseline justify-between gap-4 border-b-2 border-brand-charcoal/10 pb-4">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-display text-2xl tabular text-brand-burnt-orange">
                {formatDemoPrice({ amount: subtotal, currency: "RWF" })}
              </span>
            </div>
            <p className="mt-4 text-sm text-ink-muted">
              Delivery fee and timing are agreed with you when we confirm the
              order. Nothing is charged on this page.
            </p>
            <Button href="/checkout" size="lg" className="mt-6 w-full">
              Proceed to checkout
            </Button>
            <Button href="/shop" variant="ghost" size="md" className="mt-3 w-full">
              Keep shopping
            </Button>
            <Button
              variant="link"
              className="mt-3 w-full"
              onClick={clearCart}
            >
              Clear cart
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
}
