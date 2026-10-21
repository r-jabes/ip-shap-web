# Threat model — IP SHAP storefront

One-page baseline. Update when trust boundaries change.

## Trust boundaries

```
[Browser]
    │  HTTPS only (staging/prod)
    │  Public: HTML/JS, anon Supabase key (RLS), Turnstile site key
    ▼
[Next.js server — Vercel]
    │  Server Actions / Route Handlers (Zod-validated)
    │  Holds: service role, session secrets, email API key
    ├──────────► [Supabase Postgres + Auth + Storage]
    │              RLS for anon; service role only here
    └──────────► [Transactional email — Resend]
                   New-order notify to staff inboxes
```

**Out of scope for current launch:** payment PSPs, WhatsApp Cloud API outbound.

## Assets

| Asset | Sensitivity |
| ----- | ------------ |
| Customer name, phone, address notes | PII — orders table; lookup only with reference + confirmation code |
| Catalogue prices / stock | Business — admin write; public read published only |
| Admin credentials / sessions | Critical — invite-only Auth |
| Service role key | Critical — host secrets only |
| Order references | Public opaque ids — must not be sequential |

## Surfaces

| Surface | Spoofing | Tampering | Info disclosure | DoS | Elevation |
| ------- | -------- | --------- | --------------- | --- | --------- |
| Checkout | — | Client price → **server recompute** | — | **Rate limit** (+ Turnstile when set) | — |
| Order lookup | Stolen link | — | Enumeration → **ref + token + rate limit** | Rate limit | — |
| Admin | Phishing | — | — | Login rate limit | **Permission on every action** |
| Image upload | — | Malicious file → **MIME + re-encode** | — | Size limits | — |
| Email notify | — | — | BCC mistake → **fixed recipient list** | — | — |
| Supabase anon | Stolen anon key | — | RLS must deny private rows | — | No service role in browser |

## Explicit deferred items

| Item | Status |
| ---- | ------ |
| MoMo / card capture | Keep `ONLINE_PAYMENT_ENABLED` false |
| WhatsApp Cloud API staff alerts | Deferred — email is primary |
| CSP without unsafe-inline | Waiver until Next nonces — see `HARDENING.md` |

## Controls in place

- Security headers / CSP (`src/lib/security/headers.ts`)
- Admin HMAC session + Auth/`admin_profiles`
- Checkout price recompute + idempotency + stock reserve at place
- Order lookup token + rate limit
- Redacting logger; opaque order refs
- Optional Turnstile; optional Sentry; `/api/health`

## Incident basics

1. Rotate compromised secrets in Vercel + Supabase immediately.
2. Revoke admin sessions / invite fresh owners if Auth is compromised.
3. Do not paste secrets into chat, tickets, or Git.

See also: `SECURITY.md`, `HARDENING.md`.
