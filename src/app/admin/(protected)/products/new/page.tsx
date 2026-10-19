import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/catalogue";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">New product</h1>
      <ProductForm categories={getCategories()} />
    </div>
  );
}
