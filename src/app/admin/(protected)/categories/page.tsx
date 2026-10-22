import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { CategoryModal } from "@/components/admin/CatalogueModals";
import { adminListCategoriesDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categories = await adminListCategoriesDurable();
  const pageResult = paginateItems(categories, parseAdminPage(params.page));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Groups that organise products in the shop menu and filters."
        actions={<CategoryModal defaultOpen={params.add === "1"} />}
      />

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            No categories yet. Add your first one to organise the shop.
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            mobile={pageResult.items.map((category) => (
              <AdminCard key={category.slug}>
                <p className="font-semibold">{category.name}</p>
                <p className="mt-0.5 font-mono text-xs text-ink-muted">
                  {category.slug}
                </p>
                {category.description ? (
                  <p className="mt-2 text-sm text-ink-muted">
                    {category.description}
                  </p>
                ) : null}
                <div className="mt-3">
                  <CategoryModal category={category} />
                </div>
              </AdminCard>
            ))}
          >
            <thead>
              <tr>
                <AdminTh>Name</AdminTh>
                <AdminTh>Web address name</AdminTh>
                <AdminTh>Description</AdminTh>
                <AdminTh>
                  <span className="sr-only">Actions</span>
                </AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((category) => (
                <tr key={category.slug}>
                  <AdminTd className="font-medium">{category.name}</AdminTd>
                  <AdminTd className="font-mono text-xs">
                    {category.slug}
                  </AdminTd>
                  <AdminTd className="text-ink-muted">
                    {category.description || "—"}
                  </AdminTd>
                  <AdminTd className="text-right">
                    <CategoryModal category={category} />
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          <AdminPagination
            pathname="/admin/categories"
            searchParams={{}}
            result={pageResult}
            label="categories"
          />
        </>
      )}
    </div>
  );
}
