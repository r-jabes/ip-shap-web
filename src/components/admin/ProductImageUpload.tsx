"use client";

import { useState, useTransition } from "react";
import { uploadProductImageAction } from "@/app/admin/actions";
import { AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function ProductImageUpload({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AdminPanel className="max-w-3xl">
      <h2 className="font-display text-xl">Catalogue image</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Originals stay private. A JPEG derivative is published after magic-byte
        checks and re-encode (max 10&nbsp;MiB source).
      </p>
      <form
        className="mt-4 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setError(null);
          setOk(false);
          startTransition(async () => {
            const result = await uploadProductImageAction(formData);
            if (result?.error) setError(result.error);
            else if (result?.ok) {
              setOk(true);
              event.currentTarget.reset();
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
            Image uploaded and derivative published.
          </p>
        ) : null}
        <Button type="submit" variant="primary" loading={pending}>
          {pending ? "Uploading…" : "Upload image"}
        </Button>
      </form>
    </AdminPanel>
  );
}
