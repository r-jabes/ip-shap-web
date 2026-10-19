import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/content/PlaceholderPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="Privacy policy"
      intro="Placeholder policy page. Do not treat this as legal advice or a final privacy notice."
      sections={[
        {
          heading: "Status",
          body: "Requires qualified review before publication. Topics will include customer contact data, order records and cookie/analytics usage once those systems exist.",
        },
      ]}
    />
  );
}
