"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadProductImageAction } from "@/app/admin/actions";
import { AdminPanel } from "@/components/admin/admin-ui";
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
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();
  const current = primaryCatalogueImage(images);

  return (
    <AdminPanel className="max-w-3xl">
      <h2 className="font-display text-xl">Catalogue image</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Add a product photo when ready. Products without an image show a
        placeholder until one is uploaded.
      </p>

      <div className="mt-4 w-36 overflow-hidden rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15">
        <ProductImageFrame
          image={current}
          alt={current?.alt ?? productName}
          emptyLabel="No image yet"
        />
      </div>

      <form
        className="mt-4 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          setError(null);
          setOk(false);
          startTransition(async () => {
            const result = await uploadProductImageAction(formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            if (result?.ok) {
              setOk(true);
              form.reset();
              router.refresh();
            }
          });
        }}
      >
        <input type="hidden" name="productId" value={productId} />
        <Field id="image-alt" label="Alt text">
          <Input
            id="image-alt"
            name="alt"
            defaultValue={productName}
            required
          />
        </Field>
        <Field id="image-file" label="Image file (JPEG, PNG, or WebP)">
          <Input
            id="image-file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </Field>
        {error ? (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? (
          <p className="text-sm text-brand-charcoal" role="status">
            Image saved.
          </p>
        ) : null}
        <Button type="submit" variant="primary" loading={pending}>
          {pending ? "Uploading…" : current ? "Replace image" : "Upload image"}
        </Button>
      </form>
    </AdminPanel>
  );
}
