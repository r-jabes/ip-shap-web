# Checkout and orders (storefront)

## Guest cart

- Stored in `localStorage` as product ID + quantity only (no prices, no PII).
- Server validates product status, stock and recalculates integer RWF totals at checkout.

## Checkout (`/checkout`)

1. Contact name + phone (Rwanda-first validation; international `+` allowed).
2. Optional delivery address fields (district/sector/cell/village/directions).
3. Delivery zone selector only when zones exist; otherwise fee shown as unavailable.
4. Channel: WhatsApp-assisted (default) or online payment (disabled until `ONLINE_PAYMENT_ENABLED=true`).
5. Client sends `idempotencyKey` (UUID) to prevent duplicate orders on double submit.

## Confirmation (`/order/[reference]?token=…`)

- Shows reference, fulfilment/payment status, line snapshots and total.
- Does **not** claim payment success for WhatsApp orders.
- Optional WhatsApp deep link when `WHATSAPP_BUSINESS_E164` is set.
- Lookup requires reference + high-entropy token; rate limited.

## Payments (Phase 07)

- Live provider unselected — see backend `PAYMENT_PROVIDER_DECISION.md`.
- Sandbox initiation + `/api/payments/webhook` (HMAC) for tests only.
- Admin `/admin/orders`: confirm fulfilment; mark paid only with reference + reason.
- Notifications are log-only until a channel provider is configured.

## Delivery policy

Zones/fees are empty until configured. Checkout never invents nationwide delivery or fees.
