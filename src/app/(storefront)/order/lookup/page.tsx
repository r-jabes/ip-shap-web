import type { Metadata } from "next";
import { lookupOrderAction } from "@/app/(storefront)/checkout/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Field, Input } from "@/components/ui/Field";

export const metadata: Metadata = {
  title: "Order lookup",
  robots: { index: false, follow: false },
};

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Container className="py-10 lg:py-14">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
        Orders
      </p>
      <h1
        className="font-display mt-2 text-brand-charcoal"
        style={{ fontSize: "var(--type-display)" }}
      >
        Look up an order
      </h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Enter the order reference and private token from your confirmation.
        Lookup is rate limited and does not list other orders.
      </p>
      {error ? (
        <p
          className="mt-5 max-w-md rounded-2xl border-2 border-brand-burnt-orange bg-brand-burnt-orange/10 px-4 py-3 text-sm text-brand-charcoal"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <form
        action={lookupOrderAction}
        className="mt-8 grid max-w-md gap-4 rounded-[var(--radius-panel)] border-2 border-brand-charcoal/15 p-5 sm:p-6"
      >
        <Field id="reference" label="Reference">
          <Input
            id="reference"
            name="reference"
            required
            className="font-mono"
            placeholder="IPS-…"
            autoComplete="off"
          />
        </Field>
        <Field id="token" label="Lookup token">
          <Input
            id="token"
            name="token"
            required
            className="font-mono"
            autoComplete="off"
          />
        </Field>
        <Button type="submit" className="mt-2 w-full sm:w-auto">
          View order
        </Button>
      </form>
    </Container>
  );
}
