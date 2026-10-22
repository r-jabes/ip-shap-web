/** Shown the instant an admin link is clicked, while the next page loads. */
export default function AdminLoading() {
  return (
    <div
      className="animate-pulse space-y-6 motion-reduce:animate-none"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <div className="space-y-3">
        <div className="h-3 w-16 rounded-full bg-brand-charcoal/10" />
        <div className="h-9 w-56 max-w-full rounded-full bg-brand-charcoal/10" />
        <div className="h-3 w-80 max-w-full rounded-full bg-brand-charcoal/10" />
      </div>
      <div className="h-11 w-full max-w-md rounded-full bg-brand-charcoal/10" />
      <div className="overflow-hidden rounded-[var(--radius-frame)] border-2 border-brand-charcoal/10">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-t border-brand-charcoal/10 px-4 py-4 first:border-t-0"
          >
            <div className="h-10 w-8 shrink-0 rounded-md bg-brand-charcoal/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-1/2 rounded-full bg-brand-charcoal/10" />
              <div className="h-3 w-1/3 rounded-full bg-brand-charcoal/10" />
            </div>
            <div className="hidden h-6 w-20 rounded-full bg-brand-charcoal/10 sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
