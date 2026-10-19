"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";

export function AddToCartForm({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        addItem(productId, quantity);
      }}
    >
      <div>
        <label
          htmlFor="quantity"
          className="block text-xs tracking-[0.1em] uppercase"
        >
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) =>
            setQuantity(
              Math.max(1, Number.parseInt(event.target.value, 10) || 1),
            )
          }
          className="mt-1 w-24 border border-brand-dark-neutral/30 bg-transparent px-3 py-2"
          disabled={disabled}
        />
      </div>
      <Button type="submit" disabled={disabled}>
        Add to cart
      </Button>
    </form>
  );
}
