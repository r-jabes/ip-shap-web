import Link from "next/link";

export type RangeTickerItem = {
  index: string;
  name: string;
  count: number;
  href: string;
};

/**
 * Range strip under the hero: every range is a link (index, name, bottle
 * count), alternating solid and outlined type on charcoal. Scrolls slowly,
 * pauses on hover, and becomes a static centred list under reduced motion.
 */
export function HomeRangeTicker({ items }: { items: RangeTickerItem[] }) {

  const row = (hidden: boolean) => (
    <ul
      className="range-ticker__row flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {items.map((item, i) => (
        <li key={item.href} className="flex items-center">
          <Link
            href={item.href}
            tabIndex={hidden ? -1 : undefined}
            className="range-ticker__item group flex items-baseline gap-3 px-5 py-1 sm:px-7"
          >
            <span className="tabular text-xs font-semibold tracking-[0.14em] text-brand-burnt-orange">
              {item.index}
            </span>
            <span
              className={`range-ticker__name font-display ${
                i % 2 === 1
                  ? "range-ticker__name--outline"
                  : "text-brand-warm-white"
              }`}
            >
              {item.name}
            </span>
            <span className="hidden rounded-full border border-brand-warm-white/35 px-2 py-0.5 text-[0.7rem] font-semibold tracking-[0.06em] text-brand-warm-white/80 uppercase transition-colors duration-[var(--motion-ui)] group-hover:border-brand-burnt-orange group-hover:text-brand-burnt-orange sm:inline-block">
              {item.count} {item.count === 1 ? "bottle" : "bottles"}
            </span>
          </Link>
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rotate-45 bg-brand-burnt-orange"
          />
        </li>
      ))}
      <li className="flex items-center pl-5 sm:pl-7">
        <Link
          href="/shop"
          tabIndex={hidden ? -1 : undefined}
          className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-brand-warm-white bg-brand-burnt-orange px-5 text-sm font-semibold whitespace-nowrap text-brand-charcoal shadow-[3px_3px_0_0_var(--brand-warm-white)] transition-[transform,box-shadow] duration-[var(--motion-ui)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_var(--brand-warm-white)] motion-reduce:transition-none"
        >
          Shop all
          <span aria-hidden="true">→</span>
        </Link>
        <span
          aria-hidden="true"
          className="ml-5 inline-block h-2.5 w-2.5 rotate-45 bg-brand-burnt-orange sm:ml-7"
        />
      </li>
    </ul>
  );

  return (
    <nav
      aria-label="Shop by range"
      className="on-ink border-y-2 border-brand-charcoal bg-brand-charcoal text-brand-warm-white"
    >
      <div className="marquee range-ticker overflow-hidden py-4 sm:py-5">
        <div className="marquee-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </nav>
  );
}
