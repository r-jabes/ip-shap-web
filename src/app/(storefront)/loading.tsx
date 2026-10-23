import { Container } from "@/components/ui/Container";

/** Shown the instant a shopper taps a link, while the next page is prepared. */
export default function StorefrontLoading() {
  return (
    <Container className="py-8 lg:py-12">
      <div
        className="animate-pulse space-y-6 motion-reduce:animate-none"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Loading…</span>
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-brand-charcoal/10" />
          <div className="h-10 w-72 max-w-full rounded-full bg-brand-charcoal/10" />
          <div className="h-3 w-96 max-w-full rounded-full bg-brand-charcoal/10" />
        </div>
        <div className="h-64 w-full rounded-[var(--radius-panel)] bg-brand-charcoal/5" />
      </div>
    </Container>
  );
}
