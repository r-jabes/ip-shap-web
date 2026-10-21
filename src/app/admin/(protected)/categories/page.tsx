import {
  AdminPageHeader,
  AdminPanel,
  AdminStatus,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { saveCategoryAction } from "@/app/admin/actions";
import { adminListCategoriesDurable } from "@/lib/admin/catalogue-durable";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const categories = await adminListCategoriesDurable();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Taxonomy for shop filters and navigation."
      />
      {params.saved ? <AdminStatus>Category saved.</AdminStatus> : null}

      <AdminPanel className="max-w-xl">
        <h2 className="font-display text-xl">Add / update</h2>
        <form action={saveCategoryAction} className="mt-4 grid gap-4">
          <Field id="cat-slug" label="Slug">
            <Input
              id="cat-slug"
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="font-mono text-sm"
            />
          </Field>
          <Field id="cat-name" label="Name">
            <Input id="cat-name" name="name" required />
          </Field>
          <Field id="cat-description" label="Description">
            <Textarea id="cat-description" name="description" rows={3} />
          </Field>
          <Button type="submit" variant="primary" className="w-fit">
            Save category
          </Button>
        </form>
      </AdminPanel>

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Name</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>Description</AdminTh>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.slug}>
              <AdminTd className="font-medium">{category.name}</AdminTd>
              <AdminTd className="font-mono text-xs">{category.slug}</AdminTd>
              <AdminTd className="text-ink-muted">
                {category.description || "—"}
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
