import type { MetadataRoute } from "next";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

/** Lets customers add the shop to their phone's home screen and open it like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: LEGAL_NAME,
    short_name: SHORT_BRAND,
    description:
      "Wholesale wines, spirits, beer and soft drinks from THE IP SHAP BUSINESS LTD in Rwanda.",
    start_url: "/shop",
    display: "standalone",
    background_color: "#f5f1e8",
    theme_color: "#20201e",
    icons: [
      {
        src: "/branding/app-icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
