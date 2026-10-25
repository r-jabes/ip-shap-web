# Frontend testing

## Layers

| Layer     | Tool            | Scope                                                      |
| --------- | --------------- | ---------------------------------------------------------- |
| Unit      | Vitest          | Money invariants, env, catalogue, orders, security helpers |
| Component | Testing Library | Gallery, image frame, motion                               |
| Build     | `next build`    | Type/route integrity                                       |
| Manual    | Browser         | A11y smoke, zoom, reduced motion                           |

## Commands

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Hardening / money-flow coverage

- Money multiply/overflow invariants (random integer loops)
- Rate-limit bucket exhaustion
- Logger redaction of secrets
- Open-redirect rejection
- Stock reservation oversell rejection
- Webhook signature helpers (sandbox)

## Fixtures

Demo product fixtures are labelled and gated by `NEXT_PUBLIC_DEMO_MODE`. Do not use real customer data.

## Release checks (minimum)

1. Lint, typecheck, unit tests, production build pass
2. Home route renders without console errors
3. Skip link and focus styles work with keyboard
4. See `RELEASE_CHECKLIST.md` and `PERFORMANCE_REPORT.md`
