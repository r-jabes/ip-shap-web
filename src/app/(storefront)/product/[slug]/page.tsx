import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { formatDemoPrice } from "@/domain/catalogue";
import { getCategories, getProductBySlug, listProducts } from "@/lib/catalogue";
import { chatHref } from "@/lib/site-config";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return listProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

function availabilityLabel(value: string) {
  switch (value) {
    case "in_stock":
      return "In stock";
    case "low_stock":
      return "Low stock";
    case "out_of_stock":
      return "Out of stock";
    default:
      return "Ask us about availability";
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const unavailable = product.availability === "out_of_stock";
  const category = getCategories().find((c) => c.slug === product.categorySlug);

  return (
    <Container className="py-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {product.brandName}
            {category ? ` · ${category.name}` : ""}
          </p>
          <h1
            className="font-display mt-2 leading-tight"
            style={{ fontSize: "var(--type-h2)" }}
          >
            {product.name}
          </h1>
          <p className="font-display mt-4 text-3xl tabular">
            {formatDemoPrice(product.price)}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            {availabilityLabel(product.availability)}
          </p>
          <p className="mt-6 max-w-prose text-ink-muted">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartForm
              productId={product.id}
              productName={product.name}
              disabled={unavailable}
            />
            {unavailable ? (
              <p className="mt-3 text-sm text-ink-muted">
                This one is out of stock right now.{" "}
                <a
                  href={chatHref()}
                  className="font-semibold underline underline-offset-4"
                >
                  Ask us when it is back.
                </a>
              </p>
            ) : null}
          </div>

          <div className="mt-10 border-t border-line pt-6 text-sm">
            <h2 className="font-display text-lg">Details</h2>
            <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-2 text-ink-muted">
              <dt className="font-semibold text-brand-charcoal">Brand</dt>
              <dd>{product.brandName}</dd>
              {category ? (
                <>
                  <dt className="font-semibold text-brand-charcoal">Range</dt>
                  <dd>{category.name}</dd>
                </>
              ) : null}
              <dt className="font-semibold text-brand-charcoal">
                Availability
              </dt>
              <dd>{availabilityLabel(product.availability)}</dd>
            </dl>
            <Button href="/shop" variant="ghost" className="mt-6">
              Back to shop
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
