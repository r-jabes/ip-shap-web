import type { Metadata } from "next";
import { lookupOrderAction } from "@/app/(storefront)/checkout/actions";
import { RecentOrders } from "@/components/orders/RecentOrders";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Field, Input } from "@/components/ui/Field";
import { chatHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Find your order",
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
        Find your order
      </h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Enter your order reference and the phone number you ordered with. You
        will find the reference in your confirmation. We only show an order to
        the person who can prove it is theirs.
      </p>

      <RecentOrders />

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
        <Field
          id="reference"
          label="Order reference"
          hint="Starts with IPS-, like IPS-7K9M2X4QH3N6P8R0."
        >
          <Input
            id="reference"
            name="reference"
            required
            className="font-mono uppercase"
            placeholder="IPS-XXXXXXXXXXXXXXXX"
            autoComplete="off"
            autoCapitalize="characters"
            aria-describedby="reference-hint"
          />
        </Field>
        <Field
          id="phone"
          label="Phone number used at checkout"
          hint="Any format works, for example 0788 123 456."
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-describedby="phone-hint"
          />
        </Field>
        <details className="text-sm">
          <summary className="min-h-11 cursor-pointer font-semibold underline-offset-4 hover:underline">
            Have the private token from your confirmation link?
          </summary>
          <div className="mt-2">
            <Field id="token" label="Private token (instead of the phone number)">
              <Input
                id="token"
                name="token"
                className="font-mono"
                autoComplete="off"
              />
            </Field>
          </div>
        </details>
        <Button type="submit" className="mt-2 w-full sm:w-auto">
          View order
        </Button>
      </form>

      <p className="mt-6 max-w-md text-sm text-ink-muted">
        Cannot find it?{" "}
        <a
          href={chatHref("Hello — I need help finding my order.")}
          className="font-semibold underline underline-offset-4"
        >
          Message us
        </a>{" "}
        and we will look it up for you.
      </p>
    </Container>
  );
}
