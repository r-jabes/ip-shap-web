# Frontend release checklist

Mirror of backend `RELEASE_CHECKLIST.md` with UI focus.

## Block launch if

- Checkout can be price-tampered or double-charged without idempotency
- Admin actions work without session/permission
- Payment webhook accepts unsigned bodies
- Secrets appear in client bundles or public env

## Smoke (keyboard + mobile width)

- [ ] Skip link focuses `#main-content`
- [ ] Cart drawer: Escape, focus trap, restore focus
- [ ] Mobile shop filters: open/close, Escape
- [ ] Checkout error announced (`role="alert"`)
- [ ] 200% zoom: no critical horizontal overflow on home/shop/checkout
- [ ] `prefers-reduced-motion`: no large motion mandatory for content

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Known limitations

See backend `RELEASE_CHECKLIST.md` and `PERFORMANCE_REPORT.md`.
