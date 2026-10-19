"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  placeOrderAction,
  type CheckoutActionState,
} from "@/app/(storefront)/checkout/actions";
import type { DemoProduct } from "@/domain/catalogue";
import { formatDemoPrice } from "@/domain/catalogue";
import type { DeliveryZone } from "@/lib/orders/delivery";
import { formatRwf } from "@/lib/money";
import { Button } from "@/components/ui/Button";

type Line = { product: DemoProduct; quantity: number };

const initialState: CheckoutActionState = {};

export function CheckoutForm({
  lines,
  zones,
  onlinePaymentEnabled,
  whatsappConfigured,
}: {
  lines: Line[];
  zones: DeliveryZone[];
  onlinePaymentEnabled: boolean;
  whatsappConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    initialState,
  );
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [zoneId, setZoneId] = useState("");

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.product.price.amount * line.quantity,
        0,
      ),
    [lines],
  );

  const selectedZone = zones.find((zone) => zone.id === zoneId);
  const deliveryFee = selectedZone?.feeRwf ?? null;
  const total = subtotal + (deliveryFee ?? 0);

  const itemsJson = JSON.stringify(
    lines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
    })),
  );

  if (lines.length === 0) {
    return (
      <div className="border border-dashed border-brand-dark-neutral/30 px-6 py-16 text-center">
        <p className="font-display text-2xl">Your cart is empty</p>
        <Button href="/shop" className="mt-6">
          Shop drinks
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
    >
      <input type="hidden" name="itemsJson" value={itemsJson} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <div className="space-y-8">
        <fieldset className="space-y-3">
          <legend className="font-display text-xl">Contact</legend>
          <label className="grid gap-1 text-sm">
            Full name
            <input
              name="customerName"
              required
              maxLength={200}
              className="border border-brand-dark-neutral/30 px-3 py-2"
              autoComplete="name"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Phone (Rwanda 07… / +2507… preferred)
            <input
              name="customerPhone"
              required
              maxLength={20}
              className="border border-brand-dark-neutral/30 px-3 py-2"
              autoComplete="tel"
              placeholder="+2507…"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Order notes (optional)
            <textarea
              name="customerNotes"
              maxLength={2000}
              rows={3}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-xl">Delivery</legend>
          {zones.length === 0 ? (
            <p className="text-sm text-brand-dark-neutral">
              Delivery zones and fees are not configured yet. You can still
              place a WhatsApp-assisted order for manual confirmation — no fee
              is invented or promised.
            </p>
          ) : (
            <label className="grid gap-1 text-sm">
              Delivery zone
              <select
                name="deliveryZoneId"
                value={zoneId}
                onChange={(event) => setZoneId(event.target.value)}
                className="border border-brand-dark-neutral/30 px-3 py-2"
              >
                <option value="">Select a zone</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                    {zone.feeRwf === null
                      ? " (fee TBC)"
                      : ` — ${formatRwf(zone.feeRwf)}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              District
              <input
                name="deliveryDistrict"
                maxLength={120}
                className="border border-brand-dark-neutral/30 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Sector
              <input
                name="deliverySector"
                maxLength={120}
                className="border border-brand-dark-neutral/30 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Cell
              <input
                name="deliveryCell"
                maxLength={120}
                className="border border-brand-dark-neutral/30 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Village
              <input
                name="deliveryVillage"
                maxLength={120}
                className="border border-brand-dark-neutral/30 px-3 py-2"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            Directions / landmark
            <textarea
              name="deliveryDirections"
              maxLength={500}
              rows={2}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Delivery instructions
            <textarea
              name="deliveryInstructions"
              maxLength={500}
              rows={2}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-xl">Checkout method</legend>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="radio"
              name="channel"
              value="whatsapp_assisted"
              defaultChecked
              className="mt-1"
            />
            <span>
              WhatsApp-assisted order
              <span className="mt-1 block text-brand-dark-neutral">
                We create your order first, then you can message the shop.
                Opening WhatsApp is not payment confirmation.
                {!whatsappConfigured
                  ? " WhatsApp number is not configured yet — you will still get an order reference."
                  : ""}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="radio"
              name="channel"
              value="online_payment"
              disabled={!onlinePaymentEnabled}
              className="mt-1"
            />
            <span className={!onlinePaymentEnabled ? "opacity-50" : undefined}>
              Online payment
              <span className="mt-1 block text-brand-dark-neutral">
                {onlinePaymentEnabled
                  ? "Pay online after the order is created."
                  : "Unavailable until a Rwanda-capable payment provider is verified."}
              </span>
            </span>
          </label>
        </fieldset>

        {state.error ? (
          <p className="text-sm text-brand-burnt-orange" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>

      <aside className="h-fit border border-brand-dark-neutral/20 p-5">
        <h2 className="font-display text-xl">Order summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-3">
              <span>
                {product.name} × {quantity}
              </span>
              <span>
                {formatDemoPrice({
                  amount: product.price.amount * quantity,
                  currency: "RWF",
                })}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-brand-dark-neutral/15 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatRwf(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>
              {deliveryFee === null
                ? "Unavailable / confirm manually"
                : formatRwf(deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>Total</dt>
            <dd>
              {formatRwf(total)}
              {deliveryFee === null ? " + delivery TBC" : ""}
            </dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full bg-brand-charcoal px-4 py-3 text-sm text-brand-warm-white disabled:opacity-60"
        >
          {pending ? "Placing order…" : "Place order"}
        </button>
        <p className="mt-3 text-xs text-brand-dark-neutral">
          Prices are recalculated on the server.{" "}
          <Link href="/cart" className="underline underline-offset-4">
            Edit cart
          </Link>
        </p>
      </aside>
    </form>
  );
}
