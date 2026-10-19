"use client";

import { useMemo } from "react";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useCart } from "@/components/cart/CartProvider";
import { getProductById } from "@/lib/catalogue";
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
  const { lines } = useCart();

  const populated = useMemo(
    () =>
      lines
        .map((line) => {
          const product = getProductById(line.productId);
          if (!product) return null;
          return { product, quantity: line.quantity };
        })
        .filter(Boolean) as Array<{
        product: NonNullable<ReturnType<typeof getProductById>>;
        quantity: number;
      }>,
    [lines],
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
