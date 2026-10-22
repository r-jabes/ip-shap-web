"use client";

import { saveBrandAction, saveCategoryAction } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdvancedSection } from "@/components/admin/AdvancedSection";
import { Field, Input, Textarea } from "@/components/ui/Field";

const SLUG_HINT =
  "Used in links, like /shop?category=red-wine. It is created from the name automatically. Only change it if you need a specific link: lowercase letters, numbers and hyphens.";

export function CategoryModal({
  category,
  defaultOpen,
}: {
  category?: { slug: string; name: string; description: string };
  defaultOpen?: boolean;
}) {
  const editing = !!category;
  return (
    <AdminModal
      triggerLabel={editing ? "Edit" : "Add category"}
      triggerVariant={editing ? "ghost" : "primary"}
      title={editing ? "Edit category" : "Add category"}
      description="Categories group products in the shop menu and filters."
      defaultOpen={defaultOpen}
    >
      {(close) => (
        <ActionForm
          action={saveCategoryAction}
          submitLabel={editing ? "Save changes" : "Add category"}
          onDone={close}
          onCancel={close}
        >
          {category ? (
            <input type="hidden" name="existingSlug" value={category.slug} />
          ) : null}
          <Field
            id="cat-name"
            label="Name"
            hint="What shoppers see in menus and filters, for example Red wine."
          >
            <Input
              id="cat-name"
              name="name"
              required
              defaultValue={category?.name}
              placeholder="Red wine"
              autoComplete="off"
            />
          </Field>
          <Field
            id="cat-description"
            label="Description (optional)"
            hint="A short note about what belongs in this category."
          >
            <Textarea
              id="cat-description"
              name="description"
              rows={3}
              defaultValue={category?.description}
              placeholder="Still reds for the table."
            />
          </Field>
          <AdvancedSection hint="Web address name">
            {category ? (
              <Field
                id="cat-slug"
                label="Web address name"
                hint="Fixed once created, so existing links keep working."
              >
                <Input
                  id="cat-slug"
                  value={category.slug}
                  readOnly
                  className="font-mono text-sm"
                />
              </Field>
            ) : (
              <Field id="cat-slug" label="Web address name" hint={SLUG_HINT}>
                <Input
                  id="cat-slug"
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  title="Lowercase letters, numbers and hyphens"
                  className="font-mono text-sm"
                  placeholder="Created from the name"
                  autoComplete="off"
                />
              </Field>
            )}
          </AdvancedSection>
        </ActionForm>
      )}
    </AdminModal>
  );
}

export function BrandModal({
  brand,
  defaultOpen,
}: {
  brand?: { slug: string; name: string };
  defaultOpen?: boolean;
}) {
  const editing = !!brand;
  return (
    <AdminModal
      triggerLabel={editing ? "Edit" : "Add brand"}
      triggerVariant={editing ? "ghost" : "primary"}
      title={editing ? "Edit brand" : "Add brand"}
      description="Brands appear on product cards and in the brand filter."
      defaultOpen={defaultOpen}
    >
      {(close) => (
        <ActionForm
          action={saveBrandAction}
          submitLabel={editing ? "Save changes" : "Add brand"}
          onDone={close}
          onCancel={close}
        >
          {brand ? (
            <input type="hidden" name="existingSlug" value={brand.slug} />
          ) : null}
          <Field
            id="brand-name"
            label="Name"
            hint="How the brand is written on the shop, for example Johnnie Walker."
          >
            <Input
              id="brand-name"
              name="name"
              required
              defaultValue={brand?.name}
              placeholder="Johnnie Walker"
              autoComplete="off"
            />
          </Field>
          <AdvancedSection hint="Web address name">
            {brand ? (
              <Field
                id="brand-slug"
                label="Web address name"
                hint="Fixed once created, so existing links keep working."
              >
                <Input
                  id="brand-slug"
                  value={brand.slug}
                  readOnly
                  className="font-mono text-sm"
                />
              </Field>
            ) : (
              <Field
                id="brand-slug"
                label="Web address name"
                hint={SLUG_HINT.replace("category=red-wine", "brand=johnnie-walker")}
              >
                <Input
                  id="brand-slug"
                  name="slug"
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  title="Lowercase letters, numbers and hyphens"
                  className="font-mono text-sm"
                  placeholder="Created from the name"
                  autoComplete="off"
                />
              </Field>
            )}
          </AdvancedSection>
        </ActionForm>
      )}
    </AdminModal>
  );
}
