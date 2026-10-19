import type { Metadata } from "next";
import { CheckoutFormClient } from "@/components/checkout/CheckoutFormClient";
import { Container } from "@/components/ui/Container";
import { getServerEnv } from "@/lib/env";
import { listActiveDeliveryZones } from "@/lib/orders/delivery";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const env = getServerEnv();

  return (
    <Container className="py-10 lg:py-14">
      <h1 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
        Checkout
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-brand-dark-neutral">
        Guest checkout — no account required. The server recalculates prices and
        creates a durable order before any WhatsApp hand-off.
      </p>
      <div className="mt-10">
        <CheckoutFormClient
          zones={listActiveDeliveryZones()}
          onlinePaymentEnabled={env.ONLINE_PAYMENT_ENABLED}
          whatsappConfigured={Boolean(env.WHATSAPP_BUSINESS_E164)}
        />
      </div>
    </Container>
  );
}
