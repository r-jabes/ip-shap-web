import { confirmAgeAction, exitAgeGateAction } from "@/app/age-gate-actions";
import { Button } from "@/components/ui/Button";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

/**
 * Full-viewport age confirmation. Not shown to crawlers (see shouldShowAgeGate).
 */
export function AgeGate({ returnTo }: { returnTo: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal px-4 text-brand-warm-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md rounded-[var(--radius-panel)] border-2 border-brand-warm-white/20 bg-brand-dark-neutral p-8 shadow-[8px_8px_0_0_var(--brand-burnt-orange)]">
        <p className="text-xs font-semibold tracking-[0.16em] text-brand-burnt-orange uppercase">
          {SHORT_BRAND}
        </p>
        <h1
          id="age-gate-title"
          className="font-display mt-3 text-3xl text-brand-warm-white"
        >
          Are you of legal drinking age?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-brand-warm-white/75">
          This site sells alcohol from {LEGAL_NAME}. You must be of legal
          drinking age in your country to enter. We may ask for proof of age
          when delivering an order.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <form action={confirmAgeAction} className="flex-1">
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button type="submit" variant="on-dark" size="lg" className="w-full">
              Yes — enter
            </Button>
          </form>
          <form action={exitAgeGateAction} className="flex-1">
            <Button
              type="submit"
              variant="ghost"
              size="lg"
              className="w-full border border-brand-warm-white/30 text-brand-warm-white"
            >
              No — leave
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
