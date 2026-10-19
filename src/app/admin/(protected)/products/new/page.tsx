import { AdminPageHeader } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/Button";
import { getCategories } from "@/lib/catalogue";

export default function AdminNewProductPage() {
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
      <ProductForm categories={getCategories()} />
    </div>
  );
}
