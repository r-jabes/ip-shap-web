"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";

/** An order this fresh was placed from the cart the shopper still has open. */
const RECENT_ORDER_MS = 15 * 60 * 1000;

/**
 * Empties the cart once the shopper lands on the confirmation page of an order they just placed.
 * Revisiting an old order later (lookup link, bookmark) must not wipe a cart they are building now,
 * so only recently placed orders clear it.
 */
export function ClearCartOnConfirm({ placedAt }: { placedAt: string }) {
  const { clearCart, lines, hydrated } = useCart();

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;
    const age = Date.now() - Date.parse(placedAt);
    if (Number.isFinite(age) && age <= RECENT_ORDER_MS) {
      clearCart();
    }
  }, [clearCart, hydrated, lines.length, placedAt]);

  return null;
}
