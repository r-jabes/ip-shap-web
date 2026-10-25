import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { BrandModal } from "@/components/admin/CatalogueModals";
import { adminListBrandsDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string; page?: string }>;
}) {
  const params = await searchParams;
  const brands = await adminListBrandsDurable();
  const pageResult = paginateItems(brands, parseAdminPage(params.page));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Brands"
        description="Brands shown on product cards and in the brand filter."
        actions={<BrandModal defaultOpen={params.add === "1"} />}
      />

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            No brands yet. Brands are also created automatically when you add a
            product.
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            mobile={pageResult.items.map((brand) => (
              <AdminCard key={brand.slug}>
                <p className="font-semibold">{brand.name}</p>
                <p className="mt-0.5 font-mono text-xs text-ink-muted">
                  {brand.slug}
                </p>
                <div className="mt-3">
                  <BrandModal brand={brand} />
                </div>
              </AdminCard>
            ))}
          >
            <thead>
              <tr>
                <AdminTh>Name</AdminTh>
                <AdminTh>Web address name</AdminTh>
                <AdminTh>
                  <span className="sr-only">Actions</span>
                </AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((brand) => (
                <tr key={brand.slug}>
                  <AdminTd className="font-medium">{brand.name}</AdminTd>
                  <AdminTd className="font-mono text-xs">{brand.slug}</AdminTd>
                  <AdminTd className="text-right">
                    <BrandModal brand={brand} />
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          <AdminPagination
            pathname="/admin/brands"
            searchParams={{}}
            result={pageResult}
            label="brands"
          />
        </>
      )}
    </div>
  );
}
