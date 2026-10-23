"use client";

import { useActionState } from "react";
import {
  requestRestockAction,
  type RestockRequestState,
} from "@/app/(storefront)/product/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

const INITIAL: RestockRequestState = {};

/** Shown on a sold-out product: leave an email or phone number and we tell you when it is back. */
export function NotifyMeForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [state, formAction, pending] = useActionState(
    requestRestockAction,
    INITIAL,
  );

  if (state.ok) {
    return (
      <p
        role="status"
        className="rounded-2xl border-2 border-brand-charcoal/15 bg-paper-2 px-4 py-3 text-sm"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-2xl border-2 border-brand-charcoal/15 p-4"
    >
      <p className="text-sm font-semibold">
        Want to know when {productName} is back?
      </p>
      <input type="hidden" name="productId" value={productId} />
      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Field
        id={`notify-${productId}`}
        label="Email or phone number"
        hint="We will contact you once about this drink, then delete your details."
        error={state.error}
      >
        <Input
          id={`notify-${productId}`}
          name="contact"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com or 0788 123 456"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={
            state.error ? `notify-${productId}-error` : `notify-${productId}-hint`
          }
        />
      </Field>
      <Button type="submit" loading={pending} className="w-full sm:w-auto">
        Tell me when it is back
      </Button>
    </form>
  );
}
