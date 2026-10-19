import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatDemoPrice } from "@/domain/catalogue";
import { getHomeCollections } from "@/lib/range-media";

export function HomeCollections() {
  const tiles = getHomeCollections();
  const [lead, ...rest] = tiles;

  return (
    <section className="border-t border-line py-16 sm:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Collections"
            title="Shop by range"
            intro="Three shelves to start with. Whisky leads above; gin has its own story below."
          />
        </Reveal>

        <ul className="mt-10 grid gap-4 md:grid-cols-2 md:grid-rows-2 md:gap-5">
          {lead ? (
            <li className="md:row-span-2">
              <Reveal>
                <CollectionTile tile={lead} featured />
              </Reveal>
            </li>
          ) : null}
          {rest.map((tile, index) => (
            <li key={tile.slug}>
              <Reveal delayMs={(index + 1) * 70}>
                <CollectionTile tile={tile} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function CollectionTile({
  tile,
  featured = false,
}: {
  tile: ReturnType<typeof getHomeCollections>[number];
  featured?: boolean;
}) {
  return (
    <Link
      href={tile.href}
      className={`group relative flex h-full min-h-[16rem] overflow-hidden rounded-[1.75rem] bg-paper-2 transition-transform duration-[var(--motion-ui)] ease-[var(--ease-ui)] hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${
        featured ? "md:min-h-full" : ""
      }`}
    >
      <Image
        src={tile.image.src}
        alt=""
        width={tile.image.width}
        height={tile.image.height}
        sizes={
          featured
            ? "(max-width: 768px) 100vw, 50vw"
            : "(max-width: 768px) 100vw, 25vw"
        }
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--motion-editorial)] ease-[var(--ease-out)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/25 to-transparent"
      />
      <div className="relative mt-auto flex w-full flex-col gap-2 p-5 text-brand-warm-white sm:p-6">
        <span className="text-xs font-semibold tracking-[0.18em] text-brand-warm-white/70 uppercase">
          {tile.index} / {tile.name}
        </span>
        <span className="font-display text-3xl sm:text-4xl">{tile.name}</span>
        <span className="text-sm text-brand-warm-white/80">{tile.blurb}</span>
        {tile.fromPrice ? (
          <span className="mt-1 text-sm font-semibold tabular text-brand-warm-white">
            <span className="mr-1.5 text-[0.7em] font-medium tracking-[0.08em] text-brand-warm-white/70 uppercase">
              From
            </span>
            {formatDemoPrice(tile.fromPrice)}
          </span>
        ) : null}
      </div>
      <span className="sr-only">Browse {tile.name}</span>
    </Link>
  );
}
