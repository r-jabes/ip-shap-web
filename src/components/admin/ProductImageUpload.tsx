"use client";

import { useState, useTransition } from "react";
import { uploadProductImageAction } from "@/app/admin/actions";
import { AdminModal } from "@/components/admin/AdminModal";
import { useAdminToast } from "@/components/admin/AdminToast";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import type { ProductImage } from "@/domain/product";
import { primaryCatalogueImage } from "@/lib/product-image";

export function ProductImageUpload({
  productId,
  productName,
  images = [],
}: {
  productId: string;
  productName: string;
  images?: ProductImage[];
}) {
  const hasImage = !!primaryCatalogueImage(images);
  return (
    <AdminModal
      triggerLabel={hasImage ? "Replace image" : "Upload image"}
      triggerVariant="ghost"
      title={hasImage ? "Replace image" : "Upload image"}
      description="JPEG, PNG or WebP, up to 10 MB. Square or portrait photos on a plain background look best."
      width="sm"
    >
      {(close) => (
        <ImageForm
          productId={productId}
          productName={productName}
          images={images}
          onDone={close}
        />
      )}
    </AdminModal>
  );
}

function ImageForm({
  productId,
  productName,
  images,
  onDone,
}: {
  productId: string;
  productName: string;
  images: ProductImage[];
  onDone: () => void;
}) {
  const toast = useAdminToast();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const current = primaryCatalogueImage(images);

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          try {
            const result = await uploadProductImageAction(formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            toast.success("Image saved.");
            onDone();
          } catch {
            setError("Could not upload the image. Please try again.");
          }
        });
      }}
    >
      <div className="w-32 overflow-hidden rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15">
        <ProductImageFrame
          image={current}
          alt={current?.alt ?? productName}
          emptyLabel="No image yet"
        />
      </div>
      <input type="hidden" name="productId" value={productId} />
      <Field
        id="image-file"
        label="Image file"
        hint="Without a photo, the shop shows a neutral placeholder."
      >
        <Input
          id="image-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </Field>
      <Field
        id="image-alt"
        label="Image description"
        hint="Short text for screen readers and search engines."
      >
        <Input id="image-alt" name="alt" defaultValue={productName} required />
      </Field>
      {error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" size="md" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </form>
  );
}
