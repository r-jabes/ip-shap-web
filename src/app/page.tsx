import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { SHORT_BRAND } from "@/lib/brand";
import { getCategories, getFeaturedProducts } from "@/lib/catalogue";

export default function HomePage() {
  const featured = getFeaturedProducts(4);
  const categories = getCategories();

  return (
    <>
      <section className="relative isolate min-h-[88vh] overflow-hidden bg-brand-charcoal text-brand-warm-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(240,120,54,0.18),transparent_55%),linear-gradient(160deg,#20201E_0%,#343430_55%,#20201E_100%)]"
        />
        <Container className="relative flex min-h-[88vh] flex-col justify-end gap-10 py-16 lg:flex-row lg:items-end lg:justify-between lg:py-24">
          <div className="hero-enter max-w-xl">
            <p className="text-xs tracking-[0.2em] text-brand-burnt-orange uppercase">
              {SHORT_BRAND} · Rwanda
            </p>
            <h1
              className="mt-4 font-display leading-[1.05] text-balance"
              style={{ fontSize: "var(--type-display)" }}
            >
              Drinks, curated with quiet confidence.
            </h1>
            <p className="mt-5 max-w-md text-base text-brand-warm-white/80 sm:text-lg">
              A single-retailer storefront prototype for THE IP SHAP BUSINESS
              LTD. Shop the demo catalogue, review the visual direction, then
              replace placeholders with confirmed products.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/shop" variant="on-dark">
                Shop drinks
              </Button>
              <Button
                href="/about"
                variant="ghost"
                className="border-brand-warm-white/30 text-brand-warm-white"
              >
                About the brand
              </Button>
            </div>
          </div>
          <div className="hero-enter relative w-full max-w-sm self-stretch lg:self-end">
            <div className="relative aspect-[4/5] overflow-hidden bg-brand-dark-neutral">
              <Image
                src="/products/placeholders/bottle-charcoal.svg"
                alt="Temporary editorial placeholder bottle composition for the homepage hero"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 24rem"
                className="object-contain p-8"
              />
            </div>
            <p className="mt-3 text-xs text-brand-warm-white/55">
              Temporary hero artwork — client product photography will replace
              this in the assets phase.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-brand-dark-neutral/15 py-14">
        <Container>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2
                className="font-display text-brand-charcoal"
                style={{ fontSize: "var(--type-h2)" }}
              >
                Collections
              </h2>
              <p className="mt-2 max-w-lg text-brand-dark-neutral">
                Prototype categories for browsing patterns. Names and groupings
                await Rosine&apos;s confirmation.
              </p>
            </div>
            <DemoBadge>Demo taxonomy</DemoBadge>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="block border-t border-brand-charcoal pt-4 transition-colors duration-200 hover:border-brand-burnt-orange"
                >
                  <h3 className="font-display text-2xl">{category.name}</h3>
                  <p className="mt-2 text-sm text-brand-dark-neutral">
                    {category.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2
                className="font-display"
                style={{ fontSize: "var(--type-h2)" }}
              >
                Featured for review
              </h2>
              <p className="mt-2 max-w-xl text-brand-dark-neutral">
                Illustrative demo products for layout approval. Prices and names
                are not verified catalogue facts.
              </p>
            </div>
            <Button href="/shop" variant="secondary">
              View all
            </Button>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-brand-charcoal py-16 text-brand-warm-white">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
              Order with clarity
            </h2>
            <p className="mt-4 text-brand-warm-white/75">
              Online payment and WhatsApp-assisted ordering are planned.
              Delivery zones, fees and timelines stay unavailable until the
              business confirms them — this prototype does not invent promises.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            <li className="border-l-2 border-brand-burnt-orange pl-4">
              Demo catalogue only — replace with confirmed SKUs
            </li>
            <li className="border-l-2 border-brand-warm-white/30 pl-4">
              No fake scarcity, reviews or delivery ETAs
            </li>
            <li className="border-l-2 border-brand-warm-white/30 pl-4">
              Contact and WhatsApp numbers are placeholders
            </li>
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <h2 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
              About {SHORT_BRAND}
            </h2>
            <p className="mt-4 max-w-xl text-brand-dark-neutral">
              THE IP SHAP BUSINESS LTD is building a focused drinks retail
              experience for Rwanda. This site is the visual prototype for
              direction approval before motion polish, admin inventory and
              payments.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact">Contact</Button>
            <Button href="/delivery" variant="ghost">
              Delivery info
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
