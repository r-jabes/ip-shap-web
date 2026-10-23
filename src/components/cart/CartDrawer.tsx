"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Overlay } from "@/components/ui/Overlay";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { BagIcon, CloseIcon, TrashIcon } from "@/components/ui/icons";
import { formatDemoPrice } from "@/domain/catalogue";
import { cartSummaryLabel } from "@/lib/cart";
import { primaryCatalogueImage } from "@/lib/product-image";
import { StockNote } from "@/components/ui/StockNote";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    itemCount,
    productCount,
    hasUnavailable,
    subtotal,
    feedback,
    notice,
    dismissNotice,
    hydrated,
  } = useCart();

  return (
    <Overlay
      open={isOpen}
      onClose={closeCart}
      side="right"
      label="Shopping cart"
      panelClassName="flex h-dvh w-screen max-w-[28rem] flex-col bg-brand-warm-white text-brand-charcoal shadow-[var(--shadow-overlay)] sm:rounded-l-[var(--radius-panel)]"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
        <h2 className="font-display flex items-baseline gap-3 text-2xl">
          Your cart
          {productCount > 0 ? (
            <span className="text-base font-semibold text-ink-muted tabular">
              {cartSummaryLabel(productCount, itemCount)}
            </span>
          ) : null}
        </h2>
        <IconButton label="Close cart" size="sm" onClick={closeCart}>
          <CloseIcon size={18} />
        </IconButton>
      </div>

      {notice ? (
        <div
          role="status"
          className="flex items-start justify-between gap-3 bg-paper-2 px-5 py-3 text-sm sm:px-6"
        >
          <p>{notice}</p>
          <button
            type="button"
            onClick={dismissNotice}
            className="shrink-0 font-semibold underline underline-offset-4"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {feedback ? (
        <p
          role="status"
          className="border-b border-line px-5 py-2.5 text-sm text-ink-muted sm:px-6"
        >
          {feedback}
        </p>
      ) : null}

      <div className="site-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {!hydrated ? (
          <p className="py-10 text-center text-sm text-ink-muted">
            Loading your cart…
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-paper-2">
              <BagIcon size={34} />
            </span>
            <p className="font-display mt-6 text-2xl">Your cart is empty</p>
            <p className="mt-2 max-w-xs text-sm text-ink-muted">
              Add a few bottles and they will wait for you here.
            </p>
            <Button href="/shop" className="mt-7" onClick={closeCart}>
              Start shopping
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {items.map(({ product, quantity, stock, unavailable }) => {
              const image = primaryCatalogueImage(product.images);
              const lineTotal = product.price.amount * quantity;
              return (
                <li key={product.id} className="flex gap-4 py-5 first:pt-0">
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={closeCart}
                    className="relative h-28 w-[5.5rem] shrink-0 overflow-hidden rounded-[var(--radius-frame)] bg-paper-2"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {image ? (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {product.brandName ? (
                          <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-muted uppercase">
                            {product.brandName}
                          </p>
                        ) : null}
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={closeCart}
                          className="font-display mt-0.5 block text-lg leading-tight underline-offset-4 hover:underline"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <IconButton
                        label={`Remove ${product.name}`}
                        size="sm"
                        className="-mt-1 -mr-2 shrink-0"
                        onClick={() => removeItem(product.id)}
                      >
                        <TrashIcon size={16} />
                      </IconButton>
                    </div>
                    <p className="mt-1 text-sm text-ink-muted tabular">
                      {formatDemoPrice(product.price)}
                    </p>
                    <StockNote stock={stock} className="mt-1" />
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <QuantityStepper
                        size="sm"
                        value={quantity}
                        max={Math.max(1, stock.max)}
                        disabled={unavailable}
                        label={`Quantity of ${product.name}`}
                        onChange={(next) => setQuantity(product.id, next)}
                      />
                      {unavailable ? (
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="text-sm font-semibold underline underline-offset-4"
                        >
                          Remove
                        </button>
                      ) : (
                        <p className="font-semibold tabular">
                          {formatDemoPrice({
                            amount: lineTotal,
                            currency: "RWF",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {items.length > 0 ? (
        <div className="border-t border-line bg-brand-warm-white px-5 py-5 sm:px-6">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="font-display text-2xl tabular">
              {formatDemoPrice({ amount: subtotal, currency: "RWF" })}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-muted">
            Delivery and availability are confirmed with you before the order is
            final.
          </p>
          {hasUnavailable ? (
            <>
              <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
                Remove the out-of-stock items to continue.
              </p>
              <Button size="lg" className="mt-3 w-full" disabled>
                Checkout
              </Button>
            </>
          ) : (
            <Button
              href="/checkout"
              size="lg"
              className="mt-4 w-full"
              onClick={closeCart}
            >
              Checkout
            </Button>
          )}
          <Button
            href="/cart"
            variant="link"
            className="mt-2 w-full"
            onClick={closeCart}
          >
            View full cart
          </Button>
        </div>
      ) : null}
    </Overlay>
  );
}
