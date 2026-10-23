"use client";

import type { DemoProduct } from "@/domain/catalogue";
import { useLiveProduct } from "@/components/cart/CartProvider";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ProductDetails } from "@/components/product/ProductDetails";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PriceTag } from "@/components/ui/PriceTag";
import { StockNote } from "@/components/ui/StockNote";
import { WhatsAppIcon } from "@/components/ui/icons";
import { chatHref } from "@/lib/site-config";
import { describeStock } from "@/lib/stock/storefront";
export function ProductBuyBox({
  product: catalogueProduct,
  categoryName,
  siblings,
}: {
  product: DemoProduct;
  categoryName?: string;
  siblings: DemoProduct[];
}) {
  // Current stock, not the cached catalogue copy this page was rendered from.
  const product = useLiveProduct(catalogueProduct, { refresh: true });
  const stock = describeStock(product);
  const unavailable = stock.max === 0;
  const whatsappMessage = `Hello — I have a question about ${product.name}.`;
  const onSale = !!product.compareAtPrice;

  return (
    <div className="relative z-0 min-w-0 bg-brand-warm-white">
      <div className="flex flex-wrap items-center gap-2">
        {categoryName ? <Badge tone="outline">{categoryName}</Badge> : null}
        {onSale ? <Badge tone="accent">Sale</Badge> : null}
      </div>

      <p className="mt-4 text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
        {product.brandName}
      </p>
      <h1
        className="font-display mt-2 text-balance text-brand-charcoal"
        style={{ fontSize: "clamp(1.85rem, 1.3rem + 1.6vw, 2.75rem)" }}
      >
        {product.name}
      </h1>

      <div className="mt-4">
        <PriceTag
          price={product.price}
          compareAt={product.compareAtPrice}
          size="lg"
        />
      </div>

      <p className="mt-5 max-w-2xl text-sm text-ink-muted sm:text-base">
        {product.description}
      </p>

      {siblings.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            More from {product.brandName}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip selected disabled aria-label={`Current: ${product.name}`}>
              {shortLabel(product)}
            </Chip>
            {siblings.map((sibling) => (
              <Chip
                key={sibling.id}
                href={`/product/${sibling.slug}`}
                aria-label={sibling.name}
              >
                {shortLabel(sibling)}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative z-[1] mt-8 max-w-xl space-y-3 bg-brand-warm-white">
        <StockNote stock={stock} className="text-sm" />
        <AddToCartForm
          productId={product.id}
          productName={product.name}
          maxQuantity={stock.max}
        />
        <Button
          href={chatHref(whatsappMessage)}
          variant="secondary"
          size="lg"
          className="w-full"
          iconLeft={<WhatsAppIcon size={18} />}
        >
          Ask about this bottle
        </Button>
        {unavailable ? (
          <p className="text-sm text-ink-muted">
            This one is out of stock right now.{" "}
            <a
              href={chatHref(`Hello — when is ${product.name} back in stock?`)}
              className="font-semibold underline underline-offset-4"
            >
              Ask us when it is back
            </a>
            .
          </p>
        ) : null}
      </div>

      <div className="relative z-0 mt-8">
        <ProductDetails product={product} categoryName={categoryName} />
      </div>
    </div>
  );
}

/** Prefer the flavour/label word after the brand name when present. */
function shortLabel(product: DemoProduct): string {
  const brand = product.brandName.trim();
  if (product.name.toLowerCase().startsWith(brand.toLowerCase())) {
    const rest = product.name.slice(brand.length).trim();
    if (rest) return rest;
  }
  return product.name;
}
