"use client";

import { useMemo } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useCart } from "@/components/cart/CartProvider";
import type { DeliveryZone } from "@/lib/orders/delivery";

export function CheckoutFormClient({
  zones,
  onlinePaymentEnabled,
  whatsappConfigured,
}: {
  zones: DeliveryZone[];
  onlinePaymentEnabled: boolean;
  whatsappConfigured: boolean;
}) {
  const { items } = useCart();

  const populated = useMemo(
    () => items.map(({ product, quantity }) => ({ product, quantity })),
    [items],
  );

  return (
    <CheckoutForm
      lines={populated}
      zones={zones}
      onlinePaymentEnabled={onlinePaymentEnabled}
      whatsappConfigured={whatsappConfigured}
    />
  );
}
