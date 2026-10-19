"use client";

import Link from "next/link";
import { useState } from "react";
import type { DemoProduct } from "@/domain/catalogue";
import { useCart } from "@/components/cart/CartProvider";
import { ProductQuickView } from "@/components/catalogue/ProductQuickView";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { getCategories } from "@/lib/catalogue";
import { primaryCatalogueImage, sizesForRole } from "@/lib/product-image";
import { sampleCompareAtPrice } from "@/lib/sample-pricing";

export function ProductCard({ product }: { product: DemoProduct }) {
  const { addItem } = useCart();
  const [quickOpen, setQuickOpen] = useState(false);
  const image = primaryCatalogueImage(product.images);
  const categoryName = getCategories().find(
    (category) => category.slug === product.categorySlug,
  )?.name;
  const unavailable = product.availability === "out_of_stock";
  const onSale = !!sampleCompareAtPrice(product.price);

  return (
    <article className="group flex h-full flex-col">
      <div className="product-card-media relative overflow-hidden rounded-[var(--radius-frame)] border-2 border-brand-charcoal bg-paper-2">
        <ProductImageFrame
          image={image}
          role="catalogue_primary"
          objectFit="cover"
          sizes={sizesForRole("catalogue_primary")}
          className="rounded-none"
          imageClassName="origin-center transition-transform duration-[var(--motion-editorial)] ease-[var(--ease-out)] group-hover:scale-[1.04] group-hover:-translate-y-1 group-focus-within:scale-[1.04] group-focus-within:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-within:scale-100 motion-reduce:group-focus-within:translate-y-0"
        />
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-0"
          aria-label={product.name}
          tabIndex={-1}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between gap-2 p-2.5">
          {categoryName ? (
            <Badge tone="accent" className="shadow-sm">
              {categoryName}
            </Badge>
          ) : (
            <span />
          )}
          {onSale ? (
            <Badge tone="ink" className="shadow-sm">
              Sale
            </Badge>
          ) : null}
        </div>
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[3] flex gap-2 bg-gradient-to-t from-brand-charcoal/60 to-transparent p-2.5 pt-10 opacity-100 transition-opacity duration-[var(--motion-ui)] ease-[var(--ease-ui)] sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 motion-reduce:opacity-100">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="relative z-[3] min-w-0 flex-1 px-3"
            disabled={unavailable}
            aria-label={`Add ${product.name} to cart`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addItem(product.id, 1);
            }}
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="on-dark"
            className="relative z-[3] min-w-0 flex-1 px-3"
            aria-label={`Quick view ${product.name}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setQuickOpen(true);
            }}
          >
            View
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">
          {product.brandName}
        </p>
        <h3 className="font-display text-lg leading-snug sm:text-xl">
          <Link
            href={`/product/${product.slug}`}
            className="underline-offset-4 hover:underline"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-2">
          <PriceTag price={product.price} size="sm" showSampleSale />
        </div>
      </div>

      <ProductQuickView
        product={product}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </article>
  );
}
