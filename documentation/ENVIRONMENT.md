# Frontend environment variables

Never commit real secrets. Values below are names and purposes only.

## Public (`NEXT_PUBLIC_*`)

| Variable                        | Purpose                                                 |
| ------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | Canonical site URL (metadata, absolute links)           |
| `NEXT_PUBLIC_DEMO_MODE`         | `true`/`false` — enables clearly labelled demo fixtures |
| `NEXT_PUBLIC_WHATSAPP_E164`     | Business WhatsApp number, e.g. `+2507…`. Unset hides all WhatsApp links (they fall back to `/contact`) |
| `NEXT_PUBLIC_PHONE_E164`        | Business phone number. Unset hides it                    |
| `NEXT_PUBLIC_CONTACT_EMAIL`     | Public contact email. Unset hides it                     |
| `NEXT_PUBLIC_ADDRESS`           | Public address / location line. Unset hides it           |
| `NEXT_PUBLIC_OPENING_HOURS`     | Opening hours text. Unset hides it                       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (browser-safe)                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key (RLS-enforced)            |

## Server-only

| Variable                    | Purpose                                                               |
| --------------------------- | --------------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Supabase key — server only, never shipped to the browser   |
| `ADMIN_SESSION_SECRET`      | HMAC secret for admin session cookies (≥ 32 chars)                    |
| `ADMIN_BOOTSTRAP_TOKEN`     | Operator-generated bootstrap token (≥ 16 chars); not a default pwd    |
| `ADMIN_BOOTSTRAP_EMAIL`     | Optional allow-list email for bootstrap login                         |
| `WHATSAPP_BUSINESS_E164`    | WhatsApp Business number for deep links (unset until confirmed)       |
| `ONLINE_PAYMENT_ENABLED`    | `true` only after a Rwanda-capable provider is verified (default off) |
| `PAYMENT_PROVIDER`          | `unselected` (default) or `sandbox` for tests only                    |
| `PAYMENT_WEBHOOK_SECRET`    | HMAC secret for `/api/payments/webhook` (≥ 16 chars)                  |
| `NODE_ENV`                  | Node runtime mode                                                     |

## Validation

`src/lib/env.ts` validates public and server env with Zod. Call `getServerEnv()` only on the server.

## Local template

Copy `.env.example` to `.env.local` and fill values when Supabase is provisioned.
