import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import type { DemoProduct } from "@/domain/catalogue";
import { primaryCatalogueImage } from "@/lib/product-image";

/** Compact catalogue thumb for admin lists — placeholder when no image. */
export function AdminProductThumb({
  product,
  className = "",
}: {
  product: Pick<DemoProduct, "name" | "images">;
  className?: string;
}) {
  const image = primaryCatalogueImage(product.images);

  return (
    <div
      className={`h-12 w-10 shrink-0 overflow-hidden rounded-md border border-brand-charcoal/15 ${className}`}
    >
      <ProductImageFrame
        image={image}
        alt={image?.alt ?? `${product.name} — no image yet`}
        aspect="none"
        objectFit="contain"
        className="h-full w-full"
        emptyLabel="No image"
      />
    </div>
  );
}
