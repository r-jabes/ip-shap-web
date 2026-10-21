# Frontend environment variables

Never commit real secrets. Paste values only into host secret managers (Vercel) or local `.env.local` (gitignored).

## Environments

| Environment | `NEXT_PUBLIC_APP_URL` | `NEXT_PUBLIC_DEMO_MODE` | Supabase project | Notes |
| ----------- | --------------------- | ----------------------- | ---------------- | ----- |
| Local | `http://localhost:3000` | `true` allowed | optional / staging | Fixtures OK for UI work |
| Staging | `https://staging.…` | Prefer `false` once P6 cutover | **Staging** project | Separate keys from prod |
| Production | `https://…` (live domain) | **`false` required** | **Production** project | Never share staging keys |

**Rule:** staging and production must use **different** Supabase projects and secrets from day one (P0).

## Public (`NEXT_PUBLIC_*`) — safe in the browser

| Variable | Required | From phase | Purpose |
| -------- | -------- | ---------- | ------- |
| `NEXT_PUBLIC_APP_URL` | yes | P0 | Canonical site URL (metadata, absolute links) |
| `NEXT_PUBLIC_DEMO_MODE` | yes | P0 | `true`/`false` — demo catalogue fixtures. **Must be `false` in production** |
| `NEXT_PUBLIC_SUPABASE_URL` | from P1 | P1 | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from P1 | P1 | Anon key (RLS enforced) |
| `NEXT_PUBLIC_WHATSAPP_E164` | optional | P7 | Her WhatsApp (Contact us). Unset hides WA CTAs |
| `NEXT_PUBLIC_PHONE_E164` | optional | P7 | His call number. Unset hides phone |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional | P7 | Public contact email |
| `NEXT_PUBLIC_ADDRESS` | optional | P7 | Public address line |
| `NEXT_PUBLIC_OPENING_HOURS` | optional | P7 | Hours text |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | from P8 | P8 | Cloudflare Turnstile site key |
| `NEXT_PUBLIC_SENTRY_DSN` | from P8 | P8 | Browser error reporting (public DSN) |

## Server-only — never `NEXT_PUBLIC_*`

| Variable | Required | From phase | Purpose |
| -------- | -------- | ---------- | ------- |
| `SUPABASE_SERVICE_ROLE_KEY` | from P1 | P1 | Privileged DB — **server only** |
| `ADMIN_SESSION_SECRET` | yes (admin) | P0–P2 | HMAC cookie for admin session after Auth (≥ 32 chars) |
| `ADMIN_BOOTSTRAP_TOKEN` | optional | P0–P2 | Break-glass login only (≥ 16 chars). Prefer Supabase Auth |
| `ADMIN_BOOTSTRAP_EMAIL` | optional | P0–P2 | Allow-list for break-glass email |
| `WHATSAPP_BUSINESS_E164` | optional | P7 | Same as public WA if needed server-side (Contact us) |
| `ORDER_NOTIFY_EMAILS` | from P5 | P5 | Comma-separated staff emails for new orders |
| `EMAIL_FROM` | from P5 | P5 | From address for transactional mail (`orders@domain` or `IP SHAP Orders <orders@domain>`) |
| `RESEND_API_KEY` | from P5 | P5 | Resend API key (or swap provider; keep name stable in docs) |
| `TURNSTILE_SECRET_KEY` | from P8 | P8 | Turnstile secret |
| `SENTRY_DSN` | from P8 | P8 | Server Sentry DSN |
| `ONLINE_PAYMENT_ENABLED` | default `false` | — | Stay `false` (MoMo out of handover scope) |
| `PAYMENT_PROVIDER` | default `unselected` | — | `unselected` or `sandbox` (tests only) |
| `PAYMENT_WEBHOOK_SECRET` | if sandbox | — | HMAC for sandbox webhooks |
| `NODE_ENV` | runtime | — | `development` / `test` / `production` |

## `NEXT_PUBLIC_DEMO_MODE` policy

| Mode | Behaviour |
| ---- | --------- |
| `true` | Local/UI only — may load `src/fixtures/demo`. **Ignored in `NODE_ENV=production` builds** (P6) |
| `false` | Storefront uses published Supabase catalogue via repository + cache. Empty if no service/anon config (fail closed) |

Production deploy checklist must set `NEXT_PUBLIC_DEMO_MODE=false` (and production builds refuse fixtures anyway).

## Validation

`src/lib/env.ts` validates with Zod. Call `getServerEnv()` only on the server (or Vitest).

## Local template

```bash
cp .env.example .env.local
```

Fill values when accounts exist. Never commit `.env.local`.

## Ownership

Client (or holding company) owns: domain, Vercel team, Supabase org, Resend (or email) account, Cloudflare (DNS/Turnstile). Developers get invite access — not personal ownership of production secrets.
