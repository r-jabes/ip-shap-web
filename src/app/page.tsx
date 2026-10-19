export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
      <section className="max-w-3xl">
        <p className="mb-3 text-sm tracking-[0.14em] text-brand-dark-neutral uppercase">
          Foundation ready
        </p>
        <h1 className="font-display text-4xl leading-tight text-balance sm:text-5xl">
          THE IP SHAP BUSINESS LTD
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-brand-dark-neutral">
          Phase 00 establishes the Next.js storefront foundation, brand colour
          tokens, money conventions (integer RWF), environment validation and
          documentation. The client-facing visual prototype begins in Phase 01.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-sm bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white">
            Charcoal canvas
          </span>
          <span className="inline-flex items-center rounded-sm bg-brand-burnt-orange px-4 py-2 text-sm text-brand-charcoal">
            Burnt orange accent
          </span>
          <span className="inline-flex items-center rounded-sm border border-brand-dark-neutral/30 bg-brand-warm-white px-4 py-2 text-sm">
            Warm white base
          </span>
        </div>
      </section>

      <section
        aria-labelledby="phase-status-heading"
        className="border-t border-brand-dark-neutral/20 pt-8"
      >
        <h2
          id="phase-status-heading"
          className="font-display text-2xl text-brand-charcoal"
        >
          Current status
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-brand-dark-neutral">
          <li>No invented product catalogue in this phase.</li>
          <li>
            Demo fixtures are restricted to local/demo mode in later phases.
          </li>
          <li>
            Payment provider, delivery fees and legal compliance remain
            unresolved business decisions.
          </li>
        </ul>
      </section>
    </div>
  );
}
