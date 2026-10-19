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
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { WhatsAppIcon } from "@/components/ui/icons";

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
  const [channel, setChannel] = useState<"whatsapp_assisted" | "online_payment">(
    "whatsapp_assisted",
  );

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
  const fieldErrors = state.fieldErrors ?? {};

  const itemsJson = JSON.stringify(
    lines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
    })),
  );

  if (lines.length === 0) {
    return (
      <div className="rounded-[var(--radius-panel)] border-2 border-dashed border-brand-charcoal/25 bg-paper-2/40 px-6 py-16 text-center">
        <p className="font-display text-3xl">Your cart is empty</p>
        <p className="mx-auto mt-2 max-w-sm text-ink-muted">
          Add a few bottles first, then come back to check out.
        </p>
        <Button href="/shop" className="mt-8">
          Shop drinks
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] lg:items-start lg:gap-12"
      noValidate
    >
        <input type="hidden" name="itemsJson" value={itemsJson} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <input type="hidden" name="channel" value={channel} />

        <div className="space-y-8">
          <section className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal/15 p-5 sm:p-6">
            <h2 className="font-display text-2xl">Contact</h2>
            <p className="mt-1 text-sm text-ink-muted">
              We use these details to confirm your order.
            </p>
            <div className="mt-5 space-y-4">
              <Field
                id="customerName"
                label="Full name"
                error={fieldErrors.customerName}
              >
                <Input
                  id="customerName"
                  name="customerName"
                  required
                  maxLength={200}
                  autoComplete="name"
                  aria-invalid={fieldErrors.customerName ? true : undefined}
                  aria-describedby={
                    fieldErrors.customerName ? "customerName-error" : undefined
                  }
                />
              </Field>
              <Field
                id="customerPhone"
                label="Phone"
                hint="Rwanda 07… / +2507… preferred"
                error={fieldErrors.customerPhone}
              >
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  required
                  maxLength={20}
                  autoComplete="tel"
                  placeholder="+2507…"
                  aria-invalid={fieldErrors.customerPhone ? true : undefined}
                  aria-describedby={
                    fieldErrors.customerPhone
                      ? "customerPhone-error"
                      : "customerPhone-hint"
                  }
                />
              </Field>
              <Field id="customerNotes" label="Order notes (optional)">
                <Textarea
                  id="customerNotes"
                  name="customerNotes"
                  maxLength={2000}
                  rows={3}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal/15 p-5 sm:p-6">
            <h2 className="font-display text-2xl">Delivery</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Fee and timing are finalised with you before the order is locked
              in.
            </p>
            <div className="mt-5 space-y-4">
              {zones.length === 0 ? (
                <p className="rounded-2xl bg-paper-2 px-4 py-3 text-sm text-ink-muted">
                  We confirm your delivery fee with you after you place the
                  order. Nothing is charged on this page.
                </p>
              ) : (
                <Field
                  id="deliveryZoneId"
                  label="Delivery zone"
                  error={fieldErrors.deliveryZoneId}
                >
                  <Select
                    id="deliveryZoneId"
                    name="deliveryZoneId"
                    value={zoneId}
                    onChange={(event) => setZoneId(event.target.value)}
                    aria-invalid={
                      fieldErrors.deliveryZoneId ? true : undefined
                    }
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
                  </Select>
                </Field>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="deliveryDistrict" label="District">
                  <Input
                    id="deliveryDistrict"
                    name="deliveryDistrict"
                    maxLength={120}
                    autoComplete="address-level2"
                  />
                </Field>
                <Field id="deliverySector" label="Sector">
                  <Input
                    id="deliverySector"
                    name="deliverySector"
                    maxLength={120}
                  />
                </Field>
                <Field id="deliveryCell" label="Cell">
                  <Input id="deliveryCell" name="deliveryCell" maxLength={120} />
                </Field>
                <Field id="deliveryVillage" label="Village">
                  <Input
                    id="deliveryVillage"
                    name="deliveryVillage"
                    maxLength={120}
                  />
                </Field>
              </div>
              <Field id="deliveryDirections" label="Directions / landmark">
                <Textarea
                  id="deliveryDirections"
                  name="deliveryDirections"
                  maxLength={500}
                  rows={2}
                />
              </Field>
              <Field
                id="deliveryInstructions"
                label="Delivery instructions (optional)"
              >
                <Textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  maxLength={500}
                  rows={2}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal/15 p-5 sm:p-6">
            <h2 className="font-display text-2xl">How to finish</h2>
            <p className="mt-1 text-sm text-ink-muted">
              WhatsApp-assisted is the usual path. We create the order first,
              then you message the shop.
            </p>
            <div className="mt-5 grid gap-3">
              <ChannelOption
                selected={channel === "whatsapp_assisted"}
                onSelect={() => setChannel("whatsapp_assisted")}
                title="WhatsApp-assisted order"
                description={
                  whatsappConfigured
                    ? "Place the order here, then continue on WhatsApp. Opening WhatsApp is not payment."
                    : "Place the order here and keep your reference to contact us. Opening WhatsApp is not payment."
                }
                icon
              />
              <ChannelOption
                selected={channel === "online_payment"}
                onSelect={() => setChannel("online_payment")}
                disabled={!onlinePaymentEnabled}
                title="Online payment"
                description={
                  onlinePaymentEnabled
                    ? "Pay online after the order is created."
                    : "Not available yet. Pay when we confirm your order."
                }
              />
            </div>
          </section>

          {state.error ? (
            <p
              className="rounded-2xl border-2 border-brand-burnt-orange bg-brand-burnt-orange/10 px-4 py-3 text-sm text-brand-charcoal"
              role="alert"
              aria-live="assertive"
            >
              {state.error}
            </p>
          ) : null}
        </div>

        <aside className="h-fit rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-6 shadow-[6px_6px_0_0_var(--brand-charcoal)] lg:sticky lg:top-[calc(var(--header-h)+1.25rem)]">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="mt-5 space-y-3 border-b-2 border-brand-charcoal/10 pb-4 text-sm">
            {lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium">{product.name}</span>
                  <span className="text-ink-muted">× {quantity}</span>
                </span>
                <span className="shrink-0 tabular">
                  {formatDemoPrice({
                    amount: product.price.amount * quantity,
                    currency: "RWF",
                  })}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="tabular">{formatRwf(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">Delivery</dt>
              <dd className="tabular">
                {deliveryFee === null
                  ? "Confirm with us"
                  : formatRwf(deliveryFee)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl tabular text-brand-burnt-orange">
                {formatRwf(total)}
                {deliveryFee === null ? (
                  <span className="ml-1 text-sm font-sans font-normal text-ink-muted">
                    + delivery
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={pending}
            loading={pending}
            iconLeft={
              channel === "whatsapp_assisted" ? (
                <WhatsAppIcon size={18} />
              ) : undefined
            }
          >
            {pending
              ? "Placing order…"
              : channel === "whatsapp_assisted"
                ? "Place order"
                : "Place order & pay"}
          </Button>
          <p className="mt-3 text-center text-xs text-ink-muted">
            Prices are checked again on the server.{" "}
            <Link href="/cart" className="font-semibold underline underline-offset-4">
              Edit cart
            </Link>
          </p>
        </aside>
    </form>
  );
}

function ChannelOption({
  selected,
  onSelect,
  disabled,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  title: string;
  description: string;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition-[border-color,background-color,box-shadow] duration-[var(--motion-fast)] disabled:cursor-not-allowed disabled:opacity-45 ${
        selected
          ? "border-brand-charcoal bg-paper-2 shadow-[3px_3px_0_0_var(--brand-charcoal)]"
          : "border-brand-charcoal/20 hover:border-brand-charcoal/50"
      }`}
    >
      <span className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-brand-charcoal ${
            selected ? "bg-brand-burnt-orange" : "bg-transparent"
          }`}
        >
          {selected ? (
            <span className="h-2 w-2 rounded-full bg-brand-charcoal" />
          ) : null}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-semibold">
            {icon ? <WhatsAppIcon size={16} /> : null}
            {title}
          </span>
          <span className="mt-1 block text-sm text-ink-muted">{description}</span>
        </span>
      </span>
    </button>
  );
}
