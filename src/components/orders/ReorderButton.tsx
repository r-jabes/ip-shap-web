"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";

type Item = { productId: string; name: string; quantity: number };

/**
 * "Order again": puts the items of an earlier order back in the cart at today's prices and stock.
 * Anything that is no longer sold, or is out of stock, is skipped and named.
 */
export function ReorderButton({
  items,
  variant = "secondary",
  size = "md",
  className,
}: {
  items: Item[];
  variant?: "primary" | "secondary" | "ghost" | "on-dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { reorder } = useCart();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMessage(null);
    try {
      const { added, skipped } = await reorder(items);
      if (added === 0) {
        setMessage(
          skipped.length > 0
            ? `Sorry, ${skipped.join(", ")} ${skipped.length === 1 ? "is" : "are"} not available right now.`
            : "There was nothing to add.",
        );
      } else if (skipped.length > 0) {
        setMessage(
          `Added to your cart. ${skipped.join(", ")} ${skipped.length === 1 ? "was" : "were"} left out because ${skipped.length === 1 ? "it is" : "they are"} not available.`,
        );
      } else {
        setMessage("Added to your cart.");
      }
    } catch {
      setMessage("We could not add these just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        loading={busy}
        disabled={busy || items.length === 0}
        onClick={() => void run()}
      >
        Order again
      </Button>
      <p role="status" className="mt-2 text-sm text-ink-muted empty:hidden">
        {message}
      </p>
    </div>
  );
}
