# Platform bootstrap checklist (P0)

Create these **before or during P1**. Prefer **client-owned** orgs; invite developers.

Do **not** put API keys in chat — only confirm “created” and set values in Vercel / `.env.local`.

## Accounts

| Service | Purpose | Staging | Production | Owner |
| ------- | ------- | ------- | ---------- | ----- |
| GitHub | Source + CI | same repos | same | Dev team / client |
| Supabase | Postgres, Auth, Storage | **Project A** | **Project B** (separate) | Client |
| Vercel | Next.js host | Preview / staging env | Production env | Client |
| Resend (or Postmark) | Staff order emails | Test domain / API key | Live domain / API key | Client |
| Cloudflare | DNS + Turnstile (P7/P8) | Optional early | Required for domain | Client |
| Domain registrar | `.rw` / `.com` | — | Live hostname | Client |
| Sentry | Errors (P8) | Optional | Recommended | Client / dev |

## Vercel environment mapping

| Vercel env | Supabase | `NEXT_PUBLIC_DEMO_MODE` |
| ---------- | -------- | ----------------------- |
| Preview / Staging | Staging project | `false` after catalogue cutover (P6); `true` only if intentionally demoing |
| Production | Production project | **`false` always** |

## Email (P5)

- Verify sending domain in Resend (Gmail addresses cannot be used as `EMAIL_FROM` without a verified domain).  
- Set `EMAIL_FROM` (e.g. `IP SHAP Orders <orders@yourdomain>`).  
- Set `ORDER_NOTIFY_EMAILS` to both owners’ addresses (comma-separated).  

## Contact details (confirmed by client)

Local Rwanda `07…` numbers stored as E.164 `+2507…`. Set the same values in Vercel staging/production.

| Role | Channel | Value | Env |
| ---- | ------- | ----- | --- |
| Her (Rosine) | WhatsApp — Contact us | `+250790801271` | `NEXT_PUBLIC_WHATSAPP_E164`, `WHATSAPP_BUSINESS_E164` |
| Him (Patrick) | Voice calls | `+250788937270` | `NEXT_PUBLIC_PHONE_E164` |
| Business | Public email | `patrickiradukunda505@gmail.com` | `NEXT_PUBLIC_CONTACT_EMAIL` |
| Hours | Opening | 08:00–20:00 | `NEXT_PUBLIC_OPENING_HOURS` |
| Both | New-order email alerts | `yadufashijerosine@gmail.com`, `patrickiradukunda505@gmail.com` | `ORDER_NOTIFY_EMAILS` |
| Her | New-order human follow-up | Same WhatsApp as Contact us | (no Cloud API yet — email is primary) |
| Both | Admin logins | Supabase Auth invites (P2) | — |

## Done when (P0)

- [ ] This checklist reviewed with client  
- [ ] Env matrix published in `ENVIRONMENT.md`  
- [ ] Threat model in `THREAT_MODEL.md`  
- [ ] CI runs lint, typecheck, test, build, critical audit on PR  
- [ ] Staging Supabase + Vercel projects created (or scheduled) — keys never in Git  
