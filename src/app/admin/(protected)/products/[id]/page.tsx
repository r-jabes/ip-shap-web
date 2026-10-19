import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategories } from "@/lib/catalogue";
import { adminGetProduct } from "@/lib/admin/store";

type Params = Promise<{ id: string }>;

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const product = adminGetProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Edit product</h1>
        {query.saved ? (
          <p className="mt-2 text-sm text-brand-dark-neutral" role="status">
            Saved.
          </p>
        ) : null}
      </div>
      <ProductForm product={product} categories={getCategories()} />
    </div>
  );
}
