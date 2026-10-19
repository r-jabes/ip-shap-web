/**
 * Infinite horizontal text strip (pure CSS, transform only). Items repeat once for a seamless
 * loop; the duplicate is `aria-hidden`. Under reduced motion the strip becomes a static wrapped list.
 */
export function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const row = (hidden: boolean) => (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {items.map((item) => (
        <li
          key={item}
          className="font-display flex items-center text-[clamp(1.5rem,1rem+2vw,2.75rem)] whitespace-nowrap uppercase"
        >
          <span className="px-6">{item}</span>
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rotate-45 bg-brand-burnt-orange"
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
