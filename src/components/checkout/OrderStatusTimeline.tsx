import type { FulfilmentStatus } from "@/lib/orders/transitions";

const STEPS: Array<{ id: FulfilmentStatus; label: string }> = [
  { id: "awaiting_confirmation", label: "Awaiting confirmation" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "Preparing" },
  { id: "ready_for_dispatch", label: "Ready" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
];

function stepIndex(status: FulfilmentStatus): number {
  return STEPS.findIndex((step) => step.id === status);
}

/** Compact fulfilment timeline for the confirmation page. */
export function OrderStatusTimeline({
  status,
}: {
  status: FulfilmentStatus;
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

  const current = Math.max(0, stepIndex(status));

  return (
    <ol className="space-y-0" aria-label="Order status">
      {STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.id} className="flex gap-4">
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
              {index < STEPS.length - 1 ? (
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
              {step.label}
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
