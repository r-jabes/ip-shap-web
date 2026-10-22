import { redirect } from "next/navigation";

/** Product creation now happens in a popup on the products page. */
export default function AdminNewProductPage() {
  redirect("/admin/products?add=1");
}
