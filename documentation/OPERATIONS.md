# Frontend operations

## Deploy (planned)

- Host on a Node-compatible platform (e.g. Vercel) with environment variables from `ENVIRONMENT.md`
- Production must set `NEXT_PUBLIC_DEMO_MODE=false` unless a deliberate staging demo is required
- Coordinate Supabase project refs with the backend repo

## Local development with backend

1. Start local or remote Supabase per `backend/documentation/README.md`
2. Copy URL + anon key into `frontend/.env.local`
3. Run `npm run dev` in `frontend/`

## Rollback

- Redeploy previous frontend artifact / Git commit
- Schema rollbacks are owned by the backend migration process — do not attempt destructive DB changes from the frontend repo

## Monitoring (later)

- Platform request logs
- Structured application logs via `src/lib/logger.ts`
- Never log payment credentials or unnecessary PII
