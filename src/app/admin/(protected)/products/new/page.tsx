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
        description="New products start as drafts until you publish them."
        actions={
          <Button href="/admin/products" variant="link" size="sm">
            Back to list
          </Button>
        }
      />
      <ProductForm categories={categories} canEditPrice />
    </div>
  );
}
