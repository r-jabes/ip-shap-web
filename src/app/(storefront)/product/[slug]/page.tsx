import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductRelated } from "@/components/product/ProductRelated";
import { ProductStickyBar } from "@/components/product/ProductStickyBar";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  getBrandSiblings,
  getCategories,
  getProductBySlug,
  getRelatedProducts,
  listProducts,
} from "@/lib/catalogue";

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

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategories().find((c) => c.slug === product.categorySlug);
  const siblings = getBrandSiblings(product);
  const related = getRelatedProducts(product, 4);

  return (
    <>
      <Container className="py-8 pb-[calc(var(--bottom-bar-h)+5.5rem)] lg:py-12 lg:pb-16">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            ...(category
              ? [
                  {
                    name: category.name,
                    href: `/shop?category=${category.slug}`,
                  },
                ]
              : []),
            { name: product.name },
          ]}
        />

        <div className="product-purchase grid gap-8 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
          <div className="product-purchase__media">
            <div className="product-purchase__media-sticky">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>
          </div>
          <div className="product-purchase__info min-w-0">
            <ProductBuyBox
              product={product}
              categoryName={category?.name}
              siblings={siblings}
            />
            <div className="mt-2 border-t-2 border-brand-charcoal/15 py-5">
              <Button href="/shop" variant="ghost" size="sm">
                Back to shop
              </Button>
            </div>
          </div>
        </div>

        <ProductRelated
          products={related}
          categoryName={category?.name}
          categorySlug={category?.slug}
        />
      </Container>
      <ProductStickyBar product={product} />
    </>
  );
}
