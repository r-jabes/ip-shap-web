import { Container } from "@/components/ui/Container";

/** Drink-grid skeleton so filtering and paging feel instant. */
export default function ShopLoading() {
  return (
    <Container className="py-8 lg:py-12">
      <div
        className="animate-pulse motion-reduce:animate-none"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Loading drinks…</span>
        <div className="space-y-3">
          <div className="h-3 w-20 rounded-full bg-brand-charcoal/10" />
          <div className="h-10 w-60 max-w-full rounded-full bg-brand-charcoal/10" />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[18.5rem_minmax(0,1fr)] lg:gap-10">
          <div className="hidden h-[28rem] rounded-[var(--radius-panel)] border-2 border-brand-charcoal/10 bg-brand-charcoal/5 lg:block" />
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="space-y-3">
                <div className="aspect-[4/5] rounded-[var(--radius-panel)] bg-brand-charcoal/10" />
                <div className="h-3 w-3/4 rounded-full bg-brand-charcoal/10" />
                <div className="h-3 w-1/3 rounded-full bg-brand-charcoal/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
