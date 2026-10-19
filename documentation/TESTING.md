# Frontend testing

## Layers

| Layer             | Tool            | Scope                            |
| ----------------- | --------------- | -------------------------------- |
| Unit              | Vitest          | Money, env parsing, pure helpers |
| Component (later) | Testing Library | Interactive UI                   |
| Build             | `next build`    | Type/route integrity             |
| Manual            | Browser         | Visual / a11y smoke              |

## Commands

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Fixtures

Demo product fixtures (later) must be labelled and gated by `NEXT_PUBLIC_DEMO_MODE`. Do not use real customer data.

## Release checks (minimum)

1. Lint, typecheck, unit tests, production build pass
2. Home route renders without console errors
3. Skip link and focus styles work with keyboard
