import Link from "next/link";

/** Slim brand bar above the header. Copy states only how ordering works, never delivery promises. */
export function AnnouncementBar() {
  return (
    <div className="on-ink bg-brand-charcoal text-brand-warm-white">
      <p className="mx-auto flex min-h-[var(--announcement-h)] max-w-7xl items-center justify-center gap-3 px-4 py-1.5 text-center text-[0.8rem] font-medium tracking-[0.02em]">
        <span
          aria-hidden="true"
          className="hidden h-2 w-2 rotate-45 bg-brand-burnt-orange sm:inline-block"
        />
        <span>
          Add your drinks to the cart, then send your order on WhatsApp.
        </span>
        <Link
          href="/faq"
          className="hidden font-semibold underline decoration-brand-burnt-orange decoration-2 underline-offset-4 hover:decoration-current sm:inline"
        >
          How it works
        </Link>
      </p>
    </div>
  );
}
