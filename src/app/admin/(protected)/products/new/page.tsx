import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";
import { getCategories } from "@/lib/catalogue";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminNewProductPage() {
  const session = await getAdminSession();
  if (!session || !roleHasPermission(session.role, "products:price")) {
    // Creating a product requires an initial price.
    redirect("/admin/products");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New product"
        description="Drafts stay off the storefront until published."
        actions={
          <Button href="/admin/products" variant="link" size="sm">
            Back to list
          </Button>
        }
      />
      <ProductForm categories={getCategories()} canEditPrice />
    </div>
  );
}
