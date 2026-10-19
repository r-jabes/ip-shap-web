import type { Metadata } from "next";
import { lookupOrderAction } from "@/app/(storefront)/checkout/actions";
import { Container } from "@/components/ui/Container";

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
      <h1 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
        Look up an order
      </h1>
      <p className="mt-2 max-w-xl text-sm text-brand-dark-neutral">
        Enter the order reference and private token from your confirmation.
        Lookup is rate limited and does not enumerate orders.
      </p>
      {error ? (
        <p className="mt-4 text-sm text-brand-accent" role="alert">
          {error}
        </p>
      ) : null}
      <form action={lookupOrderAction} className="mt-8 grid max-w-md gap-4">
        <label className="grid gap-1 text-sm">
          Reference
          <input
            name="reference"
            required
            className="border border-brand-dark-neutral/30 px-3 py-2 font-mono"
            placeholder="IPS-…"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Lookup token
          <input
            name="token"
            required
            className="border border-brand-dark-neutral/30 px-3 py-2 font-mono"
          />
        </label>
        <button
          type="submit"
          className="w-fit bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white"
        >
          View order
        </button>
      </form>
    </Container>
  );
}
