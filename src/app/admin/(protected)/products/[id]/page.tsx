import { notFound } from "next/navigation";
import {
  AdminPageHeader,
  AdminStatus,
} from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";
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
      <AdminPageHeader
        title="Edit product"
        description={product.name}
        actions={
          <Button href="/admin/products" variant="link" size="sm">
            Back to list
          </Button>
        }
      />
      {query.saved ? <AdminStatus>Saved.</AdminStatus> : null}
      <ProductForm product={product} categories={getCategories()} />
    </div>
  );
}
