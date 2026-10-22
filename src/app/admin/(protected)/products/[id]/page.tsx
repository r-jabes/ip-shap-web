import { notFound } from "next/navigation";
import {
  AdminPageHeader,
  AdminStatus,
} from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { Button } from "@/components/ui/Button";
import {
  adminGetProductDurable,
  adminListCategoriesDurable,
} from "@/lib/admin/catalogue-durable";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

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

  let product;
  try {
    product = await adminGetProductDurable(id);
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "admin_edit_product_load_error",
        id,
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    notFound();
  }
  if (!product) notFound();

  const session = await getAdminSession();
  const canEditPrice = session
    ? roleHasPermission(session.role, "products:price")
    : false;
  const categories = await adminListCategoriesDurable();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit product"
        description={product.name}
        actions={
          <Button href="/admin/products" variant="ghost" size="sm">
            Back to products
          </Button>
        }
      />
      {query.saved ? <AdminStatus>Changes saved.</AdminStatus> : null}
      <ProductForm
        product={product}
        categories={categories}
        canEditPrice={canEditPrice}
      />
      <ProductImageUpload
        productId={product.id}
        productName={product.name}
        images={product.images}
      />
    </div>
  );
}
