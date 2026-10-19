"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function AddToCartForm({
  productId,
  productName,
  disabled,
}: {
  productId: string;
  productName: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <form
      className="flex flex-wrap items-stretch gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        addItem(productId, quantity);
      }}
    >
      <QuantityStepper
        value={quantity}
        label={`Quantity of ${productName}`}
        onChange={setQuantity}
        disabled={disabled}
      />
      <Button
        type="submit"
        size="lg"
        disabled={disabled}
        className="min-w-[10rem] flex-1"
      >
        Add to cart
      </Button>
    </form>
  );
}
