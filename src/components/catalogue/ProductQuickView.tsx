"use client";

import Link from "next/link";
import type { DemoProduct } from "@/domain/catalogue";
import { useCart } from "@/components/cart/CartProvider";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Overlay } from "@/components/ui/Overlay";
import { PriceTag } from "@/components/ui/PriceTag";
import { primaryCatalogueImage, sizesForRole } from "@/lib/product-image";
import { getCategories } from "@/lib/catalogue";
import { sampleCompareAtPrice } from "@/lib/sample-pricing";

export function ProductQuickView({
  product,
  open,
  onClose,
}: {
  product: DemoProduct | null;
  open: boolean;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  if (!product) return null;

  const image = primaryCatalogueImage(product.images);
  const categoryName = getCategories().find(
    (category) => category.slug === product.categorySlug,
  )?.name;
  const unavailable = product.availability === "out_of_stock";
  const onSale = !!sampleCompareAtPrice(product.price);

  return (
    <Overlay
      open={open}
      onClose={onClose}
      side="center"
      label={`Quick view: ${product.name}`}
      panelClassName="w-[min(100%,44rem)] max-h-[min(92dvh,40rem)] overflow-hidden rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white shadow-[6px_6px_0_0_var(--brand-charcoal)]"
    >
      <div className="grid max-h-[min(92dvh,40rem)] sm:grid-cols-[minmax(0,42%)_minmax(0,1fr)] sm:items-stretch">
        <div className="relative min-h-[14rem] border-b-2 border-brand-charcoal sm:min-h-0 sm:border-r-2 sm:border-b-0">
          <div className="absolute inset-0">
            <ProductImageFrame
              image={image}
              role="catalogue_primary"
              aspect="none"
              objectFit="cover"
              position="50% 40%"
              sizes={sizesForRole("catalogue_primary")}
              className="rounded-none"
            />
          </div>
        </div>
        <div className="flex max-h-[min(92dvh,40rem)] flex-col gap-4 overflow-y-auto p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {categoryName ? <Badge tone="outline">{categoryName}</Badge> : null}
            {onSale ? <Badge tone="accent">Sale</Badge> : null}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">
              {product.brandName}
            </p>
            <h2 className="font-display mt-1 text-2xl leading-snug">
              {product.name}
            </h2>
          </div>
          <PriceTag price={product.price} size="lg" showSampleSale />
          <p className="line-clamp-4 text-sm text-ink-muted">
            {product.description}
          </p>
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={unavailable}
              onClick={() => {
                addItem(product.id, 1);
                onClose();
              }}
            >
              Add to cart
            </Button>
            <Button
              href={`/product/${product.slug}`}
              variant="ghost"
              size="md"
              onClick={onClose}
            >
              View details
            </Button>
          </div>
          <p className="text-xs text-ink-muted">
            Or{" "}
            <Link
              href={`/product/${product.slug}`}
              className="underline underline-offset-4"
              onClick={onClose}
            >
              open the full product page
            </Link>
            .
          </p>
        </div>
      </div>
    </Overlay>
  );
}
