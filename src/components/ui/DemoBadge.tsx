export function DemoBadge({
  children = "Demo sample",
}: {
  children?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center rounded-sm bg-brand-burnt-orange/15 px-2 py-0.5 text-[0.7rem] font-medium tracking-[0.08em] text-brand-charcoal uppercase">
      {children}
    </span>
  );
}
