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
import { Field, Input } from "@/components/ui/Field";
import { saveBrandAction } from "@/app/admin/actions";
import { adminListBrandsDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; page?: string }>;
}) {
  const params = await searchParams;
  const brands = await adminListBrandsDurable();
  const pageResult = paginateItems(brands, parseAdminPage(params.page));
  const query = {
    saved: params.saved,
  };

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
          <Field
            id="brand-slug"
            label="Slug"
            hint="URL-safe id used in filters and product records. Lowercase letters, numbers, and hyphens only — for example johnnie-walker."
          >
            <Input
              id="brand-slug"
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              className="font-mono text-sm"
              placeholder="johnnie-walker"
              autoComplete="off"
            />
          </Field>
          <Field
            id="brand-name"
            label="Name"
            hint="Display name shown on product cards."
          >
            <Input
              id="brand-name"
              name="name"
              required
              placeholder="Johnnie Walker"
              autoComplete="off"
            />
          </Field>
          <Button type="submit" variant="primary" className="w-fit">
            Save brand
          </Button>
        </form>
      </AdminPanel>

      <section className="space-y-3">
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Name</AdminTh>
              <AdminTh>Slug</AdminTh>
            </tr>
          </thead>
          <tbody>
            {pageResult.items.map((brand) => (
              <tr key={brand.slug}>
                <AdminTd className="font-medium">{brand.name}</AdminTd>
                <AdminTd className="font-mono text-xs">{brand.slug}</AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
        {pageResult.total === 0 ? (
          <p className="text-sm text-ink-muted">No brands yet.</p>
        ) : (
          <AdminPagination
            pathname="/admin/brands"
            searchParams={query}
            result={pageResult}
            label="brands"
          />
        )}
      </section>
    </div>
  );
}
