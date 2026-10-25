"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { confirmAgeAction, exitAgeGateAction } from "@/app/age-gate-actions";
import { Button } from "@/components/ui/Button";
import {
  AGE_GATE_BOOT_SCRIPT,
  AGE_GATE_OK_ATTRIBUTE,
  confirmAgeInBrowser,
} from "@/lib/age-gate";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

/**
 * Full-viewport age confirmation. The page behind it is identical for everyone (so it can be
 * cached); a boot script marks <html> for returning visitors and crawlers and a stylesheet
 * rule (`.age-gate`) hides the gate for them before it is ever painted.
 */
export function AgeGate() {
  const confirmFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!document.documentElement.hasAttribute(AGE_GATE_OK_ATTRIBUTE)) {
      confirmFormRef.current?.querySelector("button")?.focus();
    }
  }, []);

  function onConfirm(event: FormEvent<HTMLFormElement>) {
    // With JavaScript the answer is saved in the browser and the gate closes in place.
    // Without it the form falls back to the server action below.
    event.preventDefault();
    confirmAgeInBrowser();
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: AGE_GATE_BOOT_SCRIPT }} />
      <div
        className="age-gate fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal px-4 text-brand-warm-white"
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
            <form
              ref={confirmFormRef}
              action={confirmAgeAction}
              onSubmit={onConfirm}
              className="flex-1"
            >
              <input type="hidden" name="returnTo" value="/" />
              <Button
                type="submit"
                variant="on-dark"
                size="lg"
                className="w-full"
              >
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
    </>
  );
}
