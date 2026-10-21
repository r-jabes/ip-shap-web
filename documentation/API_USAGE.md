# Frontend API usage

## Patterns

### Public catalogue reads

- Prefer Server Components and the catalogue repository (cached published products).
- Browser anon key + RLS when a client-side read is required.
- Production builds never load `fixtures/demo`.

### Privileged operations

- Orders, admin mutations, and uploads use server-only credentials (service role) inside Server Actions / Route Handlers.
- Validate all inputs with Zod at the boundary.

### Contract sync

1. Read versioned schemas from `backend/contracts/`.
2. Update frontend domain types / validators to match.
3. Note the contract version in both changelogs when behaviour changes.

### Orders

1. Create the order server-side first (durable when service role is set).
2. WhatsApp is **Contact us** only — never the checkout submission path.
3. Never treat “opened WhatsApp” as payment or confirmation.
4. Staff email via Resend is best-effort; order commit must not depend on it.

### Search

- `GET /api/search/suggest` — rate limited; uses backend `suggest_catalogue` RPC when available.

### Health

- `GET /api/health` — liveness for uptime monitors.

### Online payments

Keep `ONLINE_PAYMENT_ENABLED=false` until a Rwanda-capable provider is verified. Sandbox webhook exists for tests only.
