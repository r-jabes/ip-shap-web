"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { formatDemoPrice } from "@/domain/catalogue";
import { getProductById } from "@/lib/catalogue";
import { primaryCatalogueImage } from "@/lib/product-image";

export default function CartPage() {
  const { lines, setQuantity, removeItem, clearCart } = useCart();

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
    <Container className="py-10 lg:py-14">
      <h1 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
        Cart
      </h1>
      <p className="mt-2 text-sm text-brand-dark-neutral">
        Guest cart (product IDs only in local storage). Prices are recalculated
        at checkout on the server.
      </p>

      {populated.length === 0 ? (
        <div className="mt-12 border border-dashed border-brand-dark-neutral/30 px-6 py-16 text-center">
          <p className="font-display text-2xl">Your cart is empty</p>
          <Button href="/shop" className="mt-6">
            Shop drinks
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <ul className="space-y-6">
            {populated.map(({ line, product }) => {
              const image = primaryCatalogueImage(product.images);
              return (
                <li
                  key={product.id}
                  className="flex gap-4 border-b border-brand-dark-neutral/15 pb-6"
                >
                  <div className="relative h-28 w-24 shrink-0 bg-[#E8E2D6]">
                    {image ? (
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-display text-xl underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-brand-dark-neutral">
                      {formatDemoPrice(product.price)} · demo price
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label
                        className="text-xs uppercase"
                        htmlFor={`cart-${product.id}`}
                      >
                        Qty
                      </label>
                      <input
                        id={`cart-${product.id}`}
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(event) =>
                          setQuantity(
                            product.id,
                            Number.parseInt(event.target.value, 10) || 1,
                          )
                        }
                        className="w-20 border border-brand-dark-neutral/30 bg-transparent px-2 py-1"
                      />
                      <button
                        type="button"
                        className="text-sm underline"
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
          <aside className="h-fit border border-brand-dark-neutral/20 p-6">
            <h2 className="font-display text-xl">Summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span>Subtotal (demo)</span>
              <span className="font-medium">
                {formatDemoPrice({ amount: subtotal, currency: "RWF" })}
              </span>
            </div>
            <p className="mt-4 text-xs text-brand-dark-neutral">
              Delivery fees stay unavailable until zones are configured.
              Checkout creates a durable order before any WhatsApp hand-off.
            </p>
            <Button href="/checkout" className="mt-6 w-full">
              Proceed to checkout
            </Button>
            <button
              type="button"
              onClick={clearCart}
              className="mt-3 w-full text-sm underline"
            >
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </Container>
  );
}
