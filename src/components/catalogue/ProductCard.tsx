import Image from "next/image";
import Link from "next/link";
import type { DemoProduct } from "@/domain/catalogue";
import { formatDemoPrice } from "@/domain/catalogue";
import { DemoBadge } from "@/components/ui/DemoBadge";

export function ProductCard({ product }: { product: DemoProduct }) {
  const image = product.images[0];

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[#E8E2D6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover object-center transition-transform duration-200 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-dark-neutral">
            Image unavailable
          </div>
        )}
        <span className="absolute top-3 left-3">
          <DemoBadge>{product.demoLabel}</DemoBadge>
        </span>
      </Link>
      <div className="mt-4 flex flex-1 flex-col gap-1">
        <p className="text-xs tracking-[0.12em] text-brand-dark-neutral uppercase">
          {product.brandName}
        </p>
        <h3 className="font-display text-xl leading-snug">
          <Link
            href={`/product/${product.slug}`}
            className="underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-auto pt-2 text-sm font-medium text-brand-charcoal">
          {formatDemoPrice(product.price)}
          <span className="ml-2 text-xs font-normal text-brand-dark-neutral">
            demo price
          </span>
        </p>
      </div>
    </article>
  );
}
