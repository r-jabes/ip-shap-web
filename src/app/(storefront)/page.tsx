import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/icons";
import { SHORT_BRAND } from "@/lib/brand";
import { getCategories, getFeaturedProducts } from "@/lib/catalogue";
import { chatHref } from "@/lib/site-config";

export default function HomePage() {
  const featured = getFeaturedProducts(4);
  const categories = getCategories();

  return (
    <>
      <section className="on-ink relative isolate min-h-[82vh] overflow-hidden bg-brand-charcoal text-brand-warm-white">
        <Image
          src="/products/drink-60000.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-media object-cover object-center opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/85 to-brand-charcoal/40"
        />
        <Container className="relative flex min-h-[82vh] flex-col justify-end py-16 lg:py-24">
          <div className="hero-stagger max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-burnt-orange uppercase">
              Wines &amp; spirits · Rwanda
            </p>
            <h1 className="font-display-hero mt-4 text-balance">
              {SHORT_BRAND}
            </h1>
            <p className="mt-5 max-w-md text-base text-brand-warm-white/85 sm:text-lg">
              Whisky, vodka, gin and wine, picked with care. Choose your bottles
              and send your order on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/shop" variant="primary">
                Shop the range
              </Button>
              <Button
                href={chatHref()}
                variant="on-dark"
                iconLeft={<WhatsAppIcon size={18} />}
              >
                Chat with us
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-line py-14">
        <Container>
          <Reveal>
            <h2 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
              Shop by range
            </h2>
          </Reveal>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {categories.map((category, index) => (
              <li key={category.slug}>
                <Reveal delayMs={index * 60}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="block border-t-2 border-brand-charcoal pt-4 transition-colors duration-[var(--motion-ui)] hover:border-brand-burnt-orange"
                  >
                    <h3 className="font-display text-2xl">{category.name}</h3>
                    <p className="mt-2 text-sm text-ink-muted">
                      {category.description}
                    </p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <Reveal>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2
                className="font-display"
                style={{ fontSize: "var(--type-h2)" }}
              >
                From the shelf
              </h2>
              <Button href="/shop" variant="secondary">
                View all
              </Button>
            </div>
          </Reveal>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="on-ink bg-brand-charcoal py-16 text-brand-warm-white">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center">
          <Reveal>
            <h2 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
              How ordering works
            </h2>
            <p className="mt-4 text-brand-warm-white/75">
              Fill your cart, check out, and send the order to us on WhatsApp.
              We confirm availability and delivery with you directly.
            </p>
          </Reveal>
          <Reveal delayMs={80}>
            <ol className="space-y-4">
              {[
                "Pick your bottles and add them to the cart",
                "Check out with your name and delivery details",
                "Send the order on WhatsApp and we confirm it with you",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-4 border-l-2 border-brand-burnt-orange pl-4"
                >
                  <span className="font-display text-brand-burnt-orange tabular">
                    0{index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <Reveal className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <h2
                className="font-display"
                style={{ fontSize: "var(--type-h2)" }}
              >
                About {SHORT_BRAND}
              </h2>
              <p className="mt-4 max-w-xl text-ink-muted">
                THE IP SHAP BUSINESS LTD is a drinks retailer based in Rwanda,
                focused on a tight range of wines and spirits.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/contact">Contact</Button>
              <Button href="/delivery" variant="ghost">
                Delivery info
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
