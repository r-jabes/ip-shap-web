# Frontend API usage guide

## Status (Phase 00)

No live catalogue or order API calls are implemented yet. Environment slots for Supabase are prepared.

## Intended patterns

### Public catalogue reads

- Use the Supabase JS client with the anon key from the browser or Server Components
- Rely on RLS so only `published` (or explicitly allowed demo) rows are visible

### Privileged operations

- Admin mutations and webhook-driven updates use server-only credentials or Edge Functions in `backend/`
- Next.js Route Handlers may proxy privileged operations when documented

### Contract sync

1. Read versioned schemas from `backend/contracts/`
2. Update frontend domain types / validators to match
3. Note the contract version in both changelogs

### In-app orders (P5)

1. Create the order server-side first (durable when service role is set)
2. WhatsApp is Contact us only — never the checkout path
3. Never treat “opened WhatsApp” as payment or order confirmation
4. Staff email via Resend is best-effort; order commit must not depend on it

### Online payments (later)

Do not select or hard-code a provider until Rwanda merchant eligibility, methods, settlement, fees, currency and current API docs are verified.
