# Frontend security

## Rules

1. Never put service-role keys, webhook secrets or payment credentials in `NEXT_PUBLIC_*` variables.
2. Validate all external input at Route Handler / Server Action boundaries.
3. Do not trust client-supplied prices; server must recompute totals from authoritative catalogue data (later phases).
4. Logger redacts sensitive keys (`src/lib/logger.ts`).
5. Prefer RLS-backed Supabase access from the browser; use service role only in tightly scoped server code.

## Baseline checklist

- [ ] No secrets in Git
- [ ] CSP / security headers planned before production launch
- [ ] Auth session handling reviewed when admin lands
- [ ] Upload endpoints validate type, size and re-encode images (backend + admin phases)
- [ ] Age / alcohol sale restrictions reviewed by qualified local counsel before launch

## Alcohol / legal note

Alcohol may appear in the catalogue. This project does **not** claim legal compliance. A requirements checklist for qualified local review is maintained in backend security docs.
