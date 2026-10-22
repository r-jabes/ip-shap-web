import { setFeaturedAction } from "@/app/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminProductThumb } from "@/components/admin/AdminProductThumb";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ConfirmActionModal } from "@/components/admin/ConfirmActionModal";
import {
  AddFeaturedModal,
  EditFeaturedModal,
} from "@/components/admin/FeaturedModals";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";

export default async function AdminFeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const products = await adminListProductsDurable();

  const featured = products
    .filter((product) => product.isFeatured && product.status !== "archived")
    .sort(
      (a, b) =>
        (a.featuredSort ?? 0) - (b.featuredSort ?? 0) ||
        a.name.localeCompare(b.name, "en"),
    );
  const candidates = products
    .filter((product) => !product.isFeatured && product.status !== "archived")
    .sort(
      (a, b) =>
        Number(b.status === "published") - Number(a.status === "published") ||
        a.name.localeCompare(b.name, "en"),
    )
    .map((product) => ({
      id: product.id,
      name: product.name,
      brandName: product.brandName,
    }));

  const nextPosition =
    featured.length === 0
      ? 0
      : Math.max(...featured.map((product) => product.featuredSort ?? 0)) + 1;
  const pageResult = paginateItems(featured, parseAdminPage(params.page));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Featured products"
        description="Products highlighted on the home page, in the order shown here. Only published products appear in the shop."
        actions={
          <AddFeaturedModal
            candidates={candidates}
            nextPosition={nextPosition}
          />
        }
      />

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            Nothing is featured yet. Use “Feature a product” to choose what
            shoppers see first.
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            mobile={pageResult.items.map((product) => (
              <AdminCard key={product.id}>
                <div className="flex gap-3">
                  <AdminProductThumb product={product} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-ink-muted">
                      Position {product.featuredSort ?? 0} · {product.brandName}
                    </p>
                    <div className="mt-2">
                      <AdminStatusBadge status={product.status} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <EditFeaturedModal
                    productId={product.id}
                    productName={product.name}
                    position={product.featuredSort ?? 0}
                  />
                  <ConfirmActionModal
                    triggerLabel="Remove"
                    title="Remove from featured?"
                    description={`${product.name} stays in your catalogue but is no longer highlighted on the home page.`}
                    confirmLabel="Remove"
                    action={setFeaturedAction}
                    fields={{ id: product.id, featured: "false", featuredSort: "0" }}
                  />
                </div>
              </AdminCard>
            ))}
          >
            <thead>
              <tr>
                <AdminTh>Position</AdminTh>
                <AdminTh className="w-14">
                  <span className="sr-only">Image</span>
                </AdminTh>
                <AdminTh>Product</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>
                  <span className="sr-only">Actions</span>
                </AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((product) => (
                <tr key={product.id}>
                  <AdminTd className="tabular">{product.featuredSort ?? 0}</AdminTd>
                  <AdminTd>
                    <AdminProductThumb product={product} />
                  </AdminTd>
                  <AdminTd>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-ink-muted">{product.brandName}</p>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusBadge status={product.status} />
                    {product.status !== "published" ? (
                      <p className="mt-1 text-xs text-ink-muted">
                        Not shown in the shop yet
                      </p>
                    ) : null}
                  </AdminTd>
                  <AdminTd>
                    <div className="flex justify-end gap-2">
                      <EditFeaturedModal
                        productId={product.id}
                        productName={product.name}
                        position={product.featuredSort ?? 0}
                      />
                      <ConfirmActionModal
                        triggerLabel="Remove"
                        title="Remove from featured?"
                        description={`${product.name} stays in your catalogue but is no longer highlighted on the home page.`}
                        confirmLabel="Remove"
                        action={setFeaturedAction}
                        fields={{
                          id: product.id,
                          featured: "false",
                          featuredSort: "0",
                        }}
                      />
                    </div>
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          <AdminPagination
            pathname="/admin/featured"
            searchParams={{}}
            result={pageResult}
            label="featured products"
          />
        </>
      )}
    </div>
  );
}
