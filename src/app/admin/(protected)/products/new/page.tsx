import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";
import { adminListCategoriesDurable } from "@/lib/admin/catalogue-durable";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminNewProductPage() {
  const session = await getAdminSession();
  if (!session || !roleHasPermission(session.role, "products:price")) {
    redirect("/admin/products");
  }

  const categories = await adminListCategoriesDurable();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New product"
        description="Starts as a draft. Publish when details and images are ready."
        actions={
          <Button href="/admin/products" variant="ghost" size="sm">
            Back to products
          </Button>
        }
      />
      <ProductForm categories={categories} canEditPrice />
    </div>
  );
}
