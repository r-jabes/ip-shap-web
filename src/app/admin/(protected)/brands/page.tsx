import {
  AdminPageHeader,
  AdminPanel,
  AdminStatus,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { saveBrandAction } from "@/app/admin/actions";
import { adminListBrandsDurable } from "@/lib/admin/catalogue-durable";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const brands = await adminListBrandsDurable();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Brands"
        description="Brands shown on product cards and filters."
      />
      {params.saved ? <AdminStatus>Brand saved.</AdminStatus> : null}

      <AdminPanel className="max-w-xl">
        <h2 className="font-display text-xl">Add / update</h2>
        <form action={saveBrandAction} className="mt-4 grid gap-4">
          <Field id="brand-slug" label="Slug">
            <Input
              id="brand-slug"
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="font-mono text-sm"
            />
          </Field>
          <Field id="brand-name" label="Name">
            <Input id="brand-name" name="name" required />
          </Field>
          <Button type="submit" variant="primary" className="w-fit">
            Save brand
          </Button>
        </form>
      </AdminPanel>

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Name</AdminTh>
            <AdminTh>Slug</AdminTh>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.slug}>
              <AdminTd className="font-medium">{brand.name}</AdminTd>
              <AdminTd className="font-mono text-xs">{brand.slug}</AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
