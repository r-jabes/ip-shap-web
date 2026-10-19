import Link from "next/link";
import { SkipLink } from "@/components/SkipLink";

const LEGAL_NAME = "THE IP SHAP BUSINESS LTD";
const SHORT_BRAND = "IP SHAP";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-warm-white text-brand-charcoal">
      <SkipLink />
      <header className="border-b border-brand-dark-neutral/20 bg-brand-charcoal text-brand-warm-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="font-display text-lg tracking-[0.08em] uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange"
          >
            <span className="sr-only">{LEGAL_NAME}</span>
            <span aria-hidden="true">{SHORT_BRAND}</span>
          </Link>
          <nav aria-label="Primary">
            <ul className="flex items-center gap-4 text-sm">
              <li>
                <Link
                  href="/"
                  className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange"
                >
                  Home
                </Link>
              </li>
              <li>
                <span
                  className="text-brand-warm-white/60"
                  title="Shop catalogue arrives in Phase 01"
                >
                  Shop (soon)
                </span>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-brand-dark-neutral/20 bg-brand-charcoal text-brand-warm-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:px-6">
          <p className="font-display tracking-[0.08em] uppercase">
            {SHORT_BRAND}
          </p>
          <p className="text-brand-warm-white/80">{LEGAL_NAME}</p>
          <p className="text-brand-warm-white/60">
            Single-retailer drinks storefront foundation. Catalogue, checkout
            and delivery details will be confirmed with the business owner.
          </p>
        </div>
      </footer>
    </div>
  );
}
