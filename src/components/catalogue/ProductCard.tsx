import Link from "next/link";
import type { DemoProduct } from "@/domain/catalogue";
import { formatDemoPrice } from "@/domain/catalogue";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { primaryCatalogueImage, sizesForRole } from "@/lib/product-image";

export function ProductCard({ product }: { product: DemoProduct }) {
  const image = primaryCatalogueImage(product.images);

  return (
    <article className="group flex flex-col">
      <Link
        href={`/product/${product.slug}`}
        className="relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange"
      >
        <ProductImageFrame
          image={image}
          role="catalogue_primary"
          objectFit="cover"
          sizes={sizesForRole("catalogue_primary")}
          imageClassName="transition-transform duration-[var(--motion-ui)] ease-[var(--ease-ui)] group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-within:scale-100"
        />
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
            className="underline-offset-4 transition-opacity duration-[var(--motion-fast)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-auto pt-2 text-sm font-medium text-brand-charcoal">
          {formatDemoPrice(product.price)}
          <span className="ml-2 text-xs font-normal text-brand-dark-neutral">
            provisional
          </span>
        </p>
      </div>
    </article>
  );
}
