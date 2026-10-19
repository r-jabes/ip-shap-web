# Frontend data model (consumer view)

Authoritative persistence schema lives in `backend/documentation/DATA_MODEL.md`. This document describes the TypeScript shapes the storefront expects.

## Money

```ts
type MoneyRwf = { amount: number; currency: "RWF" };
```

`amount` is an integer. Formatting uses `Intl.NumberFormat` with zero fraction digits.

## Product (planned / typed in `src/domain/product.ts`)

| Field           | Notes                                          |
| --------------- | ---------------------------------------------- |
| `id`            | Stable UUID/string identity                    |
| `slug`          | Unique URL slug                                |
| `name`          | Display name (may be provisional)              |
| `description`   | Public copy; mark placeholders clearly         |
| `price`         | Integer RWF; provisional until confirmed       |
| `status`        | `draft` \| `demo` \| `published` \| `archived` |
| `images[]`      | Role, dimensions, alt, shared-photo flags      |
| `isProvisional` | Prototype / client-confirmation flag           |

## Cart / order (later phases)

Frontend will hold cart UI state; durable orders are created server-side before any WhatsApp hand-off. Opening WhatsApp is never proof of payment.

## Delivery

Zones and fees are configurable and unknown until the business confirms them. UI must support an explicit unavailable/unknown state.
