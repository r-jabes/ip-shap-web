"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

/** Clears guest cart after a successful order confirmation render. */
export function ClearCartOnConfirm() {
  const { clearCart, lines } = useCart();

  useEffect(() => {
    if (lines.length > 0) {
      clearCart();
    }
  }, [clearCart, lines.length]);

  return null;
}
