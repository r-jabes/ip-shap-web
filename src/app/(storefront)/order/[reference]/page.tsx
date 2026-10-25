import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { ClearCartOnConfirm } from "@/components/checkout/ClearCartOnConfirm";
import { OrderStatusTimeline } from "@/components/checkout/OrderStatusTimeline";
import { RememberOrder } from "@/components/orders/RememberOrder";
import { ReorderButton } from "@/components/orders/ReorderButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatRwf } from "@/lib/money";
import { lookupOrderDurable } from "@/lib/orders/durable";
import { buildWhatsAppDeepLink } from "@/lib/orders/store";
import { chatHref } from "@/lib/site-config";

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
  const { token } = await searchParams;
  if (!token) notFound();

  const order = await lookupOrderDurable(decodeURIComponent(reference), token);
  if (!order) notFound();

  // Contact us about this order — WhatsApp is not the checkout path.
  const whatsapp = buildWhatsAppDeepLink(order);
  const messageHref =
    whatsapp ??
    chatHref(
      `Hello — I placed order ${order.reference} and would like to ask about it.`,
    );
  return (
    <Container className="py-10 lg:py-14">
      <CheckoutSteps current="confirmed" />
      <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-brand-burnt-orange uppercase">
        Order placed
      </p>
      <h1
        className="font-display mt-2 text-brand-charcoal"
        style={{ fontSize: "var(--type-display)" }}
      >
        Thank you
      </h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        We have received your order{" "}
        <span className="font-semibold text-brand-charcoal">
          {order.reference}
        </span>
        {order.fulfillmentMethod === "pickup"
          ? ". Our team will confirm availability and payment, then tell you when it is ready to collect."
          : ". Our team will reach out to you shortly to confirm availability, delivery and payment."}{" "}
        Need it sooner? Use the Message us button below and we will look at your
        order straight away.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
        <section className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-6 shadow-[6px_6px_0_0_var(--brand-charcoal)]">
          <h2 className="font-display text-2xl">Status</h2>
          <div className="mt-5">
            <OrderStatusTimeline
              status={order.fulfilmentStatus}
              method={order.fulfillmentMethod}
            />
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal/15 p-6">
            <h2 className="font-display text-2xl">Order details</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-brand-charcoal/10 pb-2">
                <dt className="text-ink-muted">Reference</dt>
                <dd className="font-semibold tabular">{order.reference}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-brand-charcoal/10 pb-2">
                <dt className="text-ink-muted">Collection</dt>
                <dd>
                  {order.fulfillmentMethod === "pickup"
                    ? "Pickup"
                    : "Delivery"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-brand-charcoal/10 pb-2">
                <dt className="text-ink-muted">Payment</dt>
                <dd className="capitalize">
                  {order.paymentStatus === "unpaid"
                    ? "Awaiting payment"
                    : order.paymentStatus.replaceAll("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-brand-charcoal/10 pb-2">
                <dt className="text-ink-muted">Total</dt>
                <dd className="font-display text-xl tabular text-brand-burnt-orange">
                  {formatRwf(order.total.amount)}
                  {order.fulfillmentMethod === "delivery" &&
                  order.deliveryFee === null ? (
                    <span className="ml-1 text-sm font-sans font-normal text-ink-muted">
                      + delivery
                    </span>
                  ) : null}
                </dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-3 border-t-2 border-brand-charcoal/10 pt-5 text-sm">
              {order.items.map((item) => (
                <li
                  key={`${item.productId}-${item.quantity}`}
                  className="flex justify-between gap-3"
                >
                  <span>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-ink-muted"> × {item.quantity}</span>
                  </span>
                  <span className="tabular">
                    {formatRwf(item.lineTotal.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-charcoal p-6 text-brand-warm-white shadow-[6px_6px_0_0_var(--brand-burnt-orange)]">
            <h2 className="font-display text-2xl">Need it sooner?</h2>
            <p className="mt-2 text-sm text-brand-warm-white/75">
              We will contact you as soon as we have checked your order. If it
              is urgent, message us with your reference and we will look at it
              straight away.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                href={messageHref}
                variant="on-dark"
                size="lg"
                iconLeft={<WhatsAppIcon size={18} />}
              >
                Message us
              </Button>
              <ReorderButton
                variant="on-dark"
                size="lg"
                items={order.items.map((item) => ({
                  productId: item.productId,
                  name: item.productName,
                  quantity: item.quantity,
                }))}
              />
              <Button
                href="/shop"
                variant="link"
                className="text-brand-warm-white decoration-brand-burnt-orange"
              >
                Keep shopping
              </Button>
            </div>
          </section>
        </div>
      </div>

      <p className="mt-10 text-xs text-ink-muted">
        We remember this order on this device. To find it later on another
        phone or computer, use your reference and the phone number you ordered
        with.{" "}
        <Link
          href="/order/lookup"
          className="font-semibold underline underline-offset-4"
        >
          Order lookup
        </Link>
      </p>

      <ClearCartOnConfirm placedAt={order.createdAt} />
      <RememberOrder
        order={{
          reference: order.reference,
          token: order.lookupToken,
          placedAt: order.createdAt,
          totalRwf: order.total.amount,
        }}
      />
    </Container>
  );
}
