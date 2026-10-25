# Checkout and orders (storefront)

## Guest cart

- Stored in `localStorage` as product ID + quantity only (no prices, no PII).
- Cart UI resolves lines against the published catalogue snapshot from the server shell; checkout still validates product status, stock and recalculates integer RWF totals on the server (never trust client prices).
- Counted stock is reserved (on-hand decremented) when the order is placed — not when staff confirm or payment clears. Cancel restores.

## Checkout (`/checkout`)

1. Contact name + phone (Rwanda-first validation; international `+` allowed).
2. Optional delivery address fields (district/sector/cell/village/directions).
3. Delivery zone selector only when zones exist; otherwise fee shown as unavailable.
4. Channel: place-order (default, DB enum `whatsapp_assisted`) or online payment (disabled until `ONLINE_PAYMENT_ENABLED=true`). WhatsApp is **Contact us**, not the checkout path.
5. Client sends `idempotencyKey` (UUID) to prevent duplicate orders on double submit.
6. When Supabase service role is configured, orders persist to Postgres and stock is reserved via `reserve_order_stock`. Otherwise the in-memory store is used (local/demo).
7. Staff receive a branded Resend email (HTML + plain text, IP SHAP lockup, legal name footer) when `EMAIL_FROM`, `RESEND_API_KEY`, and `ORDER_NOTIFY_EMAILS` are set. Bare `EMAIL_FROM` addresses are sent as `IP SHAP Orders <…>`. Email failure does not roll back the order.

## Confirmation (`/order/[reference]?token=…`)

- Shows reference, fulfilment/payment status, line snapshots and total.
- Does **not** claim payment success for WhatsApp orders.
- Optional WhatsApp deep link when `WHATSAPP_BUSINESS_E164` is set.
- Lookup requires reference + high-entropy token; rate limited.

## Payments

- Live provider unselected — see backend `PAYMENT_PROVIDER_DECISION.md`.
- Sandbox initiation + `/api/payments/webhook` (HMAC) for tests only.
- Admin `/admin/orders`: confirm fulfilment; mark paid only with reference + reason.
- Staff alerts: Resend email when configured (see above).

## Delivery policy

Zones/fees are empty until configured. Checkout never invents nationwide delivery or fees.
