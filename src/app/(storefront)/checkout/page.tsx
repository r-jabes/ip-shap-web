import type { Metadata } from "next";
import { CheckoutFormClient } from "@/components/checkout/CheckoutFormClient";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
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
      <CheckoutSteps current="checkout" />
      <h1
        className="font-display mt-6 text-brand-charcoal"
        style={{ fontSize: "var(--type-display)" }}
      >
        Checkout
      </h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Guest checkout — no account needed. We create your order, then you
        finish with us on WhatsApp. Nothing is charged on this page.
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
