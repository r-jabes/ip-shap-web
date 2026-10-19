/** Visual path: Cart → Details → Confirmed. */
export function CheckoutSteps({
  current,
}: {
  current: "cart" | "checkout" | "confirmed";
}) {
  const steps = [
    { id: "cart" as const, label: "Cart", index: "01" },
    { id: "checkout" as const, label: "Details", index: "02" },
    { id: "confirmed" as const, label: "Confirmed", index: "03" },
  ];
  const activeIndex = steps.findIndex((step) => step.id === current);

  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold tracking-[0.14em] uppercase">
      {steps.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li key={step.id} className="flex items-center gap-3">
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={`h-px w-6 sm:w-10 ${
                  done || active ? "bg-brand-burnt-orange" : "bg-line-strong"
                }`}
              />
            ) : null}
            <span
              className={
                active
                  ? "text-brand-charcoal"
                  : done
                    ? "text-brand-burnt-orange"
                    : "text-ink-muted"
              }
              aria-current={active ? "step" : undefined}
            >
              <span className="tabular">{step.index}</span>
              <span className="ml-2">{step.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
