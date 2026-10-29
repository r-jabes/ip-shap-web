import { InfoPage } from "@/components/content/InfoPage";
import { Button } from "@/components/ui/Button";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "About",
  description: `${LEGAL_NAME} is a wholesale drinks supplier in ${SITE.country}: wines, spirits, beer and soft drinks at competitive prices.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Our story"
      title={`About ${SHORT_BRAND}`}
      intro={`${LEGAL_NAME} is a wholesale drinks supplier based in ${SITE.country}. We stock wines, spirits, beer and soft drinks, and we keep our prices competitive so you can buy in volume without overpaying.`}
      sections={[
        {
          index: "01",
          heading: "Wholesale, made simple",
          body: "We supply bars, restaurants, shops, events and anyone stocking up. Buy a few bottles or a few crates; ask us about bulk orders and we will quote you.",
        },
        {
          index: "02",
          heading: "Wines & spirits",
          body: "Red, white and rosé wines, sparkling wine, whisky, vodka, gin, cognac and more. Familiar names and everyday favourites, kept in stock for regular customers.",
        },
        {
          index: "03",
          heading: "Beer",
          body: "The full Bralirwa beer range, including Primus, Heineken, Amstel, Mützig and Turbo King, alongside imported favourites such as Tusker. Sold by the bottle or by the crate.",
        },
        {
          index: "04",
          heading: "Soft drinks",
          body: "The Bralirwa soft-drink line-up, from Fanta in all its flavours to Coca-Cola, Sprite, Krest, Stoney and tonic, plus Vital’O water and Cheetah energy drink.",
        },
        {
          index: "05",
          heading: "Competitive prices",
          body: "Wholesale pricing is the point of our business. We work to keep our prices among the best you will find, and we are happy to talk through larger orders.",
        },
        {
          index: "06",
          heading: "How to order",
          body: "Add what you need to your cart and check out on this site, or come and see us at the shop. We confirm availability, delivery or pickup, and payment with you afterwards, because stock moves quickly.",
        },
      ]}
      action={
        <div className="flex flex-wrap gap-3">
          <Button href="/shop" size="lg">
            Browse the shop
          </Button>
          <Button href="/contact" variant="ghost" size="lg">
            Contact us
          </Button>
        </div>
      }
    />
  );
}
