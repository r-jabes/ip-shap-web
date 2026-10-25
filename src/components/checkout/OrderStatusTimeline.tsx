import type {
  FulfilmentStatus,
  FulfillmentMethod,
} from "@/lib/orders/transitions";
import { fulfilmentFlowFor } from "@/lib/orders/transitions";
import { customerStatusLabel } from "@/lib/orders/customer-status";

function stepIndex(
  status: FulfilmentStatus,
  method: FulfillmentMethod,
): number {
  return fulfilmentFlowFor(method).findIndex((step) => step === status);
}

/** Compact fulfilment timeline for the confirmation page. */
export function OrderStatusTimeline({
  status,
  method = "delivery",
}: {
  status: FulfilmentStatus;
  method?: FulfillmentMethod;
}) {
  if (status === "cancelled") {
    return (
      <div
        className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-paper-2 px-5 py-4"
        role="status"
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
          Order status
        </p>
        <p className="font-display mt-2 text-xl">Cancelled</p>
        <p className="mt-1 text-sm text-ink-muted">
          This order is no longer active. Message us if you need help placing a
          new one.
        </p>
      </div>
    );
  }

  const steps = fulfilmentFlowFor(method);
  const current = Math.max(0, stepIndex(status, method));

  return (
    <ol className="space-y-0" aria-label="Order status">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex gap-4">
            <div className="flex w-6 flex-col items-center">
              <span
                className={`mt-1 flex h-3 w-3 shrink-0 rounded-full border-2 ${
                  active
                    ? "border-brand-burnt-orange bg-brand-burnt-orange"
                    : done
                      ? "border-brand-charcoal bg-brand-charcoal"
                      : "border-brand-charcoal/25 bg-transparent"
                }`}
                aria-hidden="true"
              />
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`my-1 w-px flex-1 min-h-6 ${
                    done ? "bg-brand-charcoal" : "bg-brand-charcoal/15"
                  }`}
                />
              ) : null}
            </div>
            <p
              className={`pb-5 text-sm ${
                active
                  ? "font-semibold text-brand-charcoal"
                  : done
                    ? "text-brand-charcoal"
                    : "text-ink-muted"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {customerStatusLabel(step)}
              {active ? (
                <span className="mt-0.5 block text-xs font-normal tracking-[0.08em] text-brand-burnt-orange uppercase">
                  Current
                </span>
              ) : null}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
