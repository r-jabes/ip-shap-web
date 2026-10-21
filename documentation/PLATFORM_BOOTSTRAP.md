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

- Verify sending domain in Resend.  
- Set `EMAIL_FROM` (e.g. `orders@yourdomain`).  
- Set `ORDER_NOTIFY_EMAILS` to both owners’ addresses (comma-separated).  

## Contact numbers (P7 — collect now)

| Role | Channel | Env |
| ---- | ------- | --- |
| Her | WhatsApp | `NEXT_PUBLIC_WHATSAPP_E164` |
| Him | Voice calls | `NEXT_PUBLIC_PHONE_E164` |
| Both | Admin logins | Supabase Auth invites (P2) |
| Both | Order emails | `ORDER_NOTIFY_EMAILS` |

## Done when (P0)

- [ ] This checklist reviewed with client  
- [ ] Env matrix published in `ENVIRONMENT.md`  
- [ ] Threat model in `THREAT_MODEL.md`  
- [ ] CI runs lint, typecheck, test, build, critical audit on PR  
- [ ] Staging Supabase + Vercel projects created (or scheduled) — keys never in Git  
