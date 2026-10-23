"use client";

import { useCallback, useEffect, useMemo } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useCart } from "@/components/cart/CartProvider";
import type { DeliveryZone } from "@/lib/orders/delivery";

export function CheckoutFormClient({
  zones,
  onlinePaymentEnabled,
  whatsappConfigured,
  turnstileSiteKey = null,
}: {
  zones: DeliveryZone[];
  onlinePaymentEnabled: boolean;
  whatsappConfigured: boolean;
  turnstileSiteKey?: string | null;
}) {
  const { items, hydrated, refreshStock } = useCart();

  // Re-check stock as soon as checkout opens so the shopper never meets a surprise at the end.
  useEffect(() => {
    if (hydrated) void refreshStock();
  }, [hydrated, refreshStock]);

  const populated = useMemo(
    () =>
      items
        .filter((item) => !item.unavailable)
        .map(({ product, quantity }) => ({ product, quantity })),
    [items],
  );
  const unavailableNames = useMemo(
    () =>
      items.filter((item) => item.unavailable).map((item) => item.product.name),
    [items],
  );

  // After a rejected order, pull fresh stock so the cart and messages match reality.
  const onOrderRejected = useCallback(() => {
    void refreshStock(undefined, { force: true });
  }, [refreshStock]);

  return (
    <CheckoutForm
      lines={populated}
      unavailableNames={unavailableNames}
      onOrderRejected={onOrderRejected}
      zones={zones}
      onlinePaymentEnabled={onlinePaymentEnabled}
      whatsappConfigured={whatsappConfigured}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}
