"use client";

import { setFeaturedAction } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import { Field, Input, Select } from "@/components/ui/Field";

export function AddFeaturedModal({
  candidates,
  nextPosition,
}: {
  candidates: Array<{ id: string; name: string; brandName: string }>;
  nextPosition: number;
}) {
  return (
    <AdminModal
      triggerLabel="Feature a product"
      title="Feature a product"
      description="Featured products are highlighted on the home page."
      width="sm"
    >
      {(close) =>
        candidates.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Every available product is already featured. Add or restore
            products first.
          </p>
        ) : (
          <ActionForm
            action={setFeaturedAction}
            submitLabel="Feature product"
            onDone={close}
            onCancel={close}
          >
            <input type="hidden" name="featured" value="true" />
            <Field id="featured-product" label="Product">
              <Select id="featured-product" name="id" required defaultValue="">
                <option value="" disabled>
                  Choose a product
                </option>
                {candidates.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.brandName
                      ? `${product.name} · ${product.brandName}`
                      : product.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              id="featured-position"
              label="Position"
              hint="Lower numbers come first. 0 is the very first."
            >
              <Input
                id="featured-position"
                name="featuredSort"
                inputMode="numeric"
                defaultValue={String(nextPosition)}
              />
            </Field>
          </ActionForm>
        )
      }
    </AdminModal>
  );
}

export function EditFeaturedModal({
  productId,
  productName,
  position,
}: {
  productId: string;
  productName: string;
  position: number;
}) {
  return (
    <AdminModal
      triggerLabel="Change position"
      triggerVariant="ghost"
      title="Change position"
      description={productName}
      width="sm"
    >
      {(close) => (
        <ActionForm
          action={setFeaturedAction}
          submitLabel="Save position"
          onDone={close}
          onCancel={close}
        >
          <input type="hidden" name="id" value={productId} />
          <input type="hidden" name="featured" value="true" />
          <Field
            id="featured-edit-position"
            label="Position"
            hint="Lower numbers come first. 0 is the very first."
          >
            <Input
              id="featured-edit-position"
              name="featuredSort"
              inputMode="numeric"
              defaultValue={String(position)}
            />
          </Field>
        </ActionForm>
      )}
    </AdminModal>
  );
}
