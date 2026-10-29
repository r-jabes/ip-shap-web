import { InfoPage } from "@/components/content/InfoPage";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/seo";
import { chatHref } from "@/lib/site-config";

export const metadata = pageMetadata({
  title: "Delivery",
  description:
    "Delivery across Rwanda from IP SHAP. Fee, timing and coverage are confirmed with you when you place an order — nothing is charged on this website.",
  path: "/delivery",
});

export default function DeliveryPage() {
  return (
    <InfoPage
      eyebrow="Getting your order"
      title="Delivery"
      intro="We serve customers within Rwanda. Fee, timing and coverage are agreed with you when you place an order — nothing is charged on this website."
      sections={[
        {
          index: "01",
          heading: "Fees and timing",
          body: "Both depend on where you are. We confirm them with you before the order is final.",
        },
        {
          index: "02",
          heading: "Before you order",
          body: "Not sure whether we reach your area? Send a message with your district and we will tell you straight.",
        },
        {
          index: "03",
          heading: "At the door",
          body: "Have someone of legal drinking age available to receive the order. We may ask for proof of age.",
        },
      ]}
      action={
        <div className="flex flex-wrap gap-3">
          <Button
            href={chatHref(
              "Hello — do you deliver to my area? My district is …",
            )}
            size="lg"
            iconLeft={<WhatsAppIcon size={18} />}
          >
            Ask about delivery
          </Button>
          <Button href="/shop" variant="ghost" size="lg">
            Browse the shop
          </Button>
        </div>
      }
    />
  );
}
