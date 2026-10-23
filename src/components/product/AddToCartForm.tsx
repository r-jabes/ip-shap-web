"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function AddToCartForm({
  productId,
  productName,
  maxQuantity,
}: {
  productId: string;
  productName: string;
  /** Most units that can be ordered right now. 0 means out of stock. */
  maxQuantity: number;
}) {
  const { addItem, lines } = useCart();
  const [quantity, setQuantity] = useState(1);

  const inCart =
    lines.find((line) => line.productId === productId)?.quantity ?? 0;
  const outOfStock = maxQuantity === 0;
  // What is still available after what the shopper already has in their cart.
  const room = Math.max(0, maxQuantity - inCart);
  const allInCart = !outOfStock && room === 0;
  const selected = Math.min(quantity, Math.max(1, room));

  return (
    <form
      className="flex flex-wrap items-stretch gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (room > 0) addItem(productId, selected);
      }}
    >
      <QuantityStepper
        value={selected}
        label={`Quantity of ${productName}`}
        onChange={setQuantity}
        max={Math.max(1, room)}
        disabled={outOfStock || allInCart}
      />
      <Button
        type="submit"
        size="lg"
        disabled={outOfStock || allInCart}
        className="min-w-[10rem] flex-1"
      >
        {outOfStock
          ? "Out of stock"
          : allInCart
            ? "All available units in cart"
            : "Add to cart"}
      </Button>
      {inCart > 0 && !outOfStock ? (
        <p className="basis-full text-sm text-ink-muted">
          You have {inCart} in your cart.
        </p>
      ) : null}
    </form>
  );
}
