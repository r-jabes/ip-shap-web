# Penetration-oriented checklist (P8)

Sign each row before production cutover. Use staging first. Do not paste secrets into tickets.

| ID | Surface | Check | Pass | Notes / waiver |
| -- | ------- | ----- | ---- | -------------- |
| S1 | IDOR — order lookup | Guessing reference alone fails; needs high-entropy token; rate limited | [ ] | |
| S2 | IDOR — admin | Unauthenticated `/admin/*` redirects; every Server Action calls `requireSession(permission)` | [ ] | |
| S3 | XSS | User-supplied notes/names render escaped; no `dangerouslySetInnerHTML` on order fields | [ ] | |
| S4 | Upload | Admin image: magic-byte + size + sharp re-encode; originals private bucket | [ ] | |
| S5 | Authz | Owner vs staff permissions on team/stock/orders; bootstrap token not in `NEXT_PUBLIC_*` | [ ] | |
| S6 | Rate limit | Login, checkout, order lookup, search suggest, contact bot gate | [ ] | In-memory per isolate |
| S7 | CSRF / bots | Turnstile enforced when secret set; Server Actions use Next cookies | [ ] | |
| S8 | Open redirect | `safeInternalPath` on login returnTo / payment return | [ ] | |
| S9 | Secrets | No service role / webhook / session secret in client bundle or Git | [ ] | |
| S10 | Headers | CSP, XFO DENY, nosniff, HSTS on HTTPS prod | [ ] | CSP unsafe-inline waiver |
| S11 | Demo mode | Production build refuses fixtures (`isDemoMode` false) | [ ] | |
| S12 | Webhook | Sandbox payment HMAC + body size cap (online payment stays disabled) | [ ] | MoMo out of scope |

**Engineer sign-off**

| Field | Value |
| ----- | ----- |
| Name | |
| Date | |
| Staging URL | |
| Critical/high vulns open | none / see `SECURITY.md` waiver |

Related: `SECURITY.md`, `THREAT_MODEL.md`, `P8_HARDENING.md`.
