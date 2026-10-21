# Threat model — IP SHAP storefront (P0)

One-page baseline for handover phases P1–P9. Update when trust boundaries change.

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

**Not in scope this handover:** payment PSPs, WhatsApp Cloud API outbound.

## Assets

| Asset | Sensitivity |
| ----- | ------------ |
| Customer name, phone, address notes | PII — orders table; lookup only with reference + confirmation code |
| Catalogue prices / stock | Business — admin write; public read published only |
| Admin credentials / sessions | Critical — invite-only Auth (P2) |
| Service role key | Critical — host secrets only |
| Order references | Public opaque ids — must not be sequential |

## STRIDE-style surfaces

| Surface | Spoofing | Tampering | Repudiation | Info disclosure | DoS | Elevation |
| ------- | -------- | --------- | ----------- | --------------- | --- | --------- |
| Checkout | — | Client price → **server recompute** | Audit + order history | — | **Rate limit** | — |
| Order lookup | Stolen link | — | — | Enumeration → **ref + token + rate limit** | Rate limit | — |
| Admin | Phishing | — | **Audit events** | — | Login rate limit | **Permission on every action** |
| Image upload (P3) | — | Malicious file → **MIME + re-encode** | Audit | — | Size limits | — |
| Email notify (P5) | — | — | Provider logs | BCC mistake → **fixed recipient list** | — | — |
| Supabase anon | Stolen anon key | — | — | RLS must deny private rows | — | No service role in browser |

## Explicit non-goals / deferred

| Item | Status |
| ---- | ------ |
| MoMo / card capture | Out of handover — do not enable `ONLINE_PAYMENT_ENABLED` |
| WhatsApp Cloud API staff alerts | Deferred — email is primary |
| Full CSP without unsafe-inline | P8 waiver — Next hydration; track nonces post-handover |

## Controls already in codebase (prototype)

- Security headers / CSP baseline (`src/lib/security/headers.ts`)
- Admin HMAC session + bootstrap rate limit
- Checkout price recompute + idempotency
- Order lookup token + rate limit
- Redacting logger
- Opaque `createDocumentId()` for public order refs

## Controls added by later phases

| Phase | Control |
| ----- | ------- |
| P1 | RLS + no demo leak in prod path |
| P2 | Supabase Auth roles |
| P3 | Secure uploads |
| P4 | Atomic stock |
| P5 | Email notify; Contact-us WhatsApp only |
| P7 | Age gate (cookie; crawlers exempt); search suggest rate limit |
| P8 | Turnstile (checkout/contact), Sentry + `/api/health`, CSP hosts, smoke/analyze scripts, restore drill doc |

## Incident basics

1. Rotate compromised secrets in Vercel + Supabase immediately.  
2. Revoke admin sessions / invite fresh owners if Auth compromised.  
3. Do not paste secrets into chat, tickets, or Git.  

See also: `SECURITY.md`, `prompts/IMPLEMENTATION_PHASES.md`.
