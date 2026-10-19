import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnConfirm } from "@/components/checkout/ClearCartOnConfirm";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { formatRwf } from "@/lib/money";
import { buildWhatsAppDeepLink, lookupOrder } from "@/lib/orders/store";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type Params = Promise<{ reference: string }>;
type SearchParams = Promise<{ token?: string; payment?: string }>;

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { reference } = await params;
  const { token, payment } = await searchParams;
  if (!token) notFound();

  const order = lookupOrder(decodeURIComponent(reference), token);
  if (!order) notFound();

  const whatsapp = buildWhatsAppDeepLink(order);
  const sandboxPending = payment === "sandbox_pending";

  return (
    <Container className="py-10 lg:py-14">
      <p className="text-xs tracking-[0.14em] text-brand-dark-neutral uppercase">
        Order placed
      </p>
      <h1 className="mt-2 font-display" style={{ fontSize: "var(--type-h2)" }}>
        Thank you
      </h1>
      <p className="mt-3 max-w-2xl text-brand-dark-neutral">
        Your order was created and is awaiting confirmation
        {order.channel === "whatsapp_assisted"
          ? " and payment instructions"
          : ""}
        . A browser redirect is never proof of payment
        {sandboxPending
          ? " — sandbox checkout is pending a verified webhook"
          : ""}
        .
      </p>

      <dl className="mt-8 grid max-w-xl gap-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-brand-dark-neutral/15 pb-2">
          <dt>Reference</dt>
          <dd className="font-medium">{order.reference}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-brand-dark-neutral/15 pb-2">
          <dt>Status</dt>
          <dd>{order.fulfilmentStatus.replaceAll("_", " ")}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-brand-dark-neutral/15 pb-2">
          <dt>Payment</dt>
          <dd>{order.paymentStatus.replaceAll("_", " ")}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-brand-dark-neutral/15 pb-2">
          <dt>Total</dt>
          <dd className="font-medium">
            {formatRwf(order.total.amount)}
            {order.deliveryFee === null ? " + delivery TBC" : ""}
          </dd>
        </div>
      </dl>

      <ul className="mt-8 max-w-xl space-y-2 text-sm">
        {order.items.map((item) => (
          <li
            key={`${item.productId}-${item.quantity}`}
            className="flex justify-between gap-3"
          >
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>{formatRwf(item.lineTotal.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        {whatsapp ? (
          <Button href={whatsapp} variant="on-dark">
            Continue on WhatsApp
          </Button>
        ) : (
          <p className="text-sm text-brand-dark-neutral">
            We will confirm this order with you. Keep your reference{" "}
            <strong>{order.reference}</strong> for follow-up.
          </p>
        )}
        <Button href="/shop" variant="ghost">
          Keep shopping
        </Button>
      </div>

      <p className="mt-8 text-xs text-brand-dark-neutral">
        Save this page URL to look up your order later. Lookup requires your
        private token and is rate limited.{" "}
        <Link href="/order/lookup" className="underline underline-offset-4">
          Order lookup
        </Link>
      </p>

      <ClearCartOnConfirm />
    </Container>
  );
}
