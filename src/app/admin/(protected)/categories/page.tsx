import {
  AdminPageHeader,
  AdminPanel,
  AdminStatus,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { saveCategoryAction } from "@/app/admin/actions";
import { adminListCategoriesDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categories = await adminListCategoriesDurable();
  const pageResult = paginateItems(categories, parseAdminPage(params.page));
  const query = {
    saved: params.saved,
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Categories"
        description="Groups used for shop filters and menus."
      />
      {params.saved ? <AdminStatus>Category saved.</AdminStatus> : null}

      <AdminPanel className="max-w-xl">
        <h2 className="font-display text-xl">Add / update</h2>
        <form action={saveCategoryAction} className="mt-4 grid gap-4">
          <Field
            id="cat-slug"
            label="Slug"
            hint="URL-safe id used in links and filters. Lowercase letters, numbers, and hyphens only — for example red-wine."
          >
            <Input
              id="cat-slug"
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="font-mono text-sm"
              placeholder="red-wine"
              autoComplete="off"
            />
          </Field>
          <Field
            id="cat-name"
            label="Name"
            hint="Label shoppers see in menus and filters."
          >
            <Input
              id="cat-name"
              name="name"
              required
              placeholder="Red wine"
              autoComplete="off"
            />
          </Field>
          <Field
            id="cat-description"
            label="Description"
            hint="Optional short note for operators or category pages."
          >
            <Textarea
              id="cat-description"
              name="description"
              rows={3}
              placeholder="Still and sparkling reds for the table."
            />
          </Field>
          <Button type="submit" variant="primary" className="w-fit">
            Save category
          </Button>
        </form>
      </AdminPanel>

      <section className="space-y-3">
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Name</AdminTh>
              <AdminTh>Slug</AdminTh>
              <AdminTh>Description</AdminTh>
            </tr>
          </thead>
          <tbody>
            {pageResult.items.map((category) => (
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
        {pageResult.total === 0 ? (
          <p className="text-sm text-ink-muted">No categories yet.</p>
        ) : (
          <AdminPagination
            pathname="/admin/categories"
            searchParams={query}
            result={pageResult}
            label="categories"
          />
        )}
      </section>
    </div>
  );
}
