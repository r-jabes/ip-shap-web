"use client";

import { ProductShelf } from "@/components/saved/ProductShelf";
import { Button } from "@/components/ui/Button";
import { useSavedIds } from "@/lib/device/use-saved";

export function SavedProducts() {
  const { ids } = useSavedIds();
  return (
    <ProductShelf
      ids={ids}
      empty={
        <div className="rounded-[var(--radius-panel)] border-2 border-dashed border-brand-charcoal/25 px-6 py-14 text-center">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            Tap the heart on any drink to keep it here. Saved drinks stay on this
            device, so you can come back to them later.
          </p>
          <Button href="/shop" className="mt-6">
            Browse the shop
          </Button>
        </div>
      }
    />
  );
}
