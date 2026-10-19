# Quality gates (R7)

Manual gates before calling the UI redesign “done”. Tick in review — do not invent passing scores.

## Breakpoints (screenshots)

| Width        | Focus                                                         | Done |
| ------------ | ------------------------------------------------------------- | ---- |
| 360–430px    | Header, bottom bar, shop filters sheet, product gallery, cart | [ ]  |
| ~768px       | Product two-column, checkout form                             | [ ]  |
| 1024px       | Shop sidebar + grid, sticky product gallery                   | [ ]  |
| 1280px       | Home hero + featured, content story cards                     | [ ]  |
| 1440px+      | Wide shop / product pairing without empty drift               | [ ]  |

## Keyboard & screen reader

- [ ] Tab through nav → search → cart → filters → gallery → zoom → checkout fields
- [ ] Skip link lands on `#main-content`
- [ ] Focus rings visible on light and dark (`.on-ink`) surfaces
- [ ] Add-to-cart announces via `aria-live` and visible toast/drawer status
- [ ] Lightbox traps focus; Escape restores trigger

## Reduced motion

- [ ] OS “reduce motion” on: hero/reveals/page-enter/cart-fly/marquee static or instant
- [ ] CTAs usable immediately (no wait for animation)
- [ ] Product grid does not scroll-animate

## Motion spot-checks

- [ ] Hero stagger ~0.7s; CTA never blocked
- [ ] Editorial `Reveal` on home + About/Delivery story cards only
- [ ] Cart fly-dot + count pulse + text feedback on add
- [ ] Shop grid settles once (no skeleton shimmer after paint)
- [ ] Route settle (`PageEnter`) is subtle; no blank transition screens

## Performance (lab)

After `npm run build && npm run start`, run Lighthouse mobile on `/` and `/shop` and paste into [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md). Field CWV still required post-deploy.

## View Transitions

Deferred until a Next.js upgrade that ships stable App Router View Transitions. Current fallback: `PageEnter` opacity/translate settle.
