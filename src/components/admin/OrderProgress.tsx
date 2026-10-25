import { formatFulfilmentLabel } from "@/lib/admin/orders-query";
import {
  fulfilmentFlowFor,
  isTerminalFulfilment,
  type FulfilmentStatus,
  type FulfillmentMethod,
} from "@/lib/orders/transitions";

/** Where the order is on its journey. Cancelled orders show a clear banner instead. */
export function OrderProgress({
  status,
  method = "delivery",
}: {
  status: FulfilmentStatus;
  method?: FulfillmentMethod;
}) {
  if (status === "cancelled") {
    return (
      <p
        role="status"
        className="rounded-2xl border-2 border-red-400 bg-red-100 px-4 py-3 text-sm font-semibold text-red-950"
      >
        This order was cancelled. Any reserved stock went back on the shelf.
      </p>
    );
  }

  const flow = fulfilmentFlowFor(method);
  const terminalDone = isTerminalFulfilment(status);
  const currentIndex = flow.indexOf(status);
  const cols =
    method === "pickup"
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <ol aria-label="Order progress" className={`grid gap-2 ${cols}`}>
      {flow.map((step, index) => {
        const done =
          (currentIndex >= 0 && index < currentIndex) ||
          (terminalDone && step === status);
        const current = index === currentIndex && !terminalDone;
        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-semibold ${
              done
                ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                : current
                  ? "border-brand-charcoal bg-brand-burnt-orange text-brand-charcoal shadow-[2px_2px_0_0_var(--brand-charcoal)]"
                  : "border-brand-charcoal/15 bg-white/50 text-ink-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] ${
                done
                  ? "bg-emerald-600 text-white"
                  : current
                    ? "bg-brand-charcoal text-brand-warm-white"
                    : "bg-brand-charcoal/10"
              }`}
            >
              {done ? "✓" : index + 1}
            </span>
            {formatFulfilmentLabel(step)}
          </li>
        );
      })}
    </ol>
  );
}
