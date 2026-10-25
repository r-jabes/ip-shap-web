"use client";

import { useState } from "react";
import { adjustStockAction } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import { Field, Input, Select } from "@/components/ui/Field";

type StockProduct = {
  id: string;
  name: string;
  quantity: number | null;
  availability: "unknown" | "in_stock" | "low_stock" | "out_of_stock";
};

function describe(product: StockProduct) {
  return product.quantity === null
    ? "Quantity not tracked"
    : `${product.quantity} on hand`;
}

export function StockModal({
  products,
  defaultOpen,
}: {
  products: StockProduct[];
  defaultOpen?: boolean;
}) {
  return (
    <AdminModal
      triggerLabel="Update stock"
      title="Update stock"
      description="Pick a product, set the new quantity and say why. Every change is logged."
      defaultOpen={defaultOpen}
    >
      {(close) => <StockFormBody products={products} onDone={close} />}
    </AdminModal>
  );
}

function StockFormBody({
  products,
  onDone,
}: {
  products: StockProduct[];
  onDone: () => void;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const selected = products.find((product) => product.id === productId);

  if (products.length === 0) {
    return <p className="text-sm text-ink-muted">Add a product first.</p>;
  }

  return (
    <ActionForm
      action={adjustStockAction}
      submitLabel="Save stock"
      onDone={onDone}
      onCancel={onDone}
    >
      <Field
        id="stock-product"
        label="Product"
        hint={selected ? `Currently: ${describe(selected)}.` : undefined}
      >
        <Select
          id="stock-product"
          name="productId"
          required
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="stock-availability" label="Availability">
          <Select
            key={productId}
            id="stock-availability"
            name="newAvailability"
            defaultValue={selected?.availability ?? "unknown"}
          >
            <option value="unknown">Not tracked</option>
            <option value="in_stock">In stock</option>
            <option value="low_stock">Running low</option>
            <option value="out_of_stock">Sold out</option>
          </Select>
        </Field>
        <Field
          id="stock-qty"
          label="New quantity"
          hint="Leave empty if you do not count this product."
        >
          <Input
            key={productId}
            id="stock-qty"
            name="newQuantity"
            inputMode="numeric"
            defaultValue={
              selected?.quantity === null || selected?.quantity === undefined
                ? ""
                : String(selected.quantity)
            }
          />
        </Field>
      </div>
      <Field
        id="stock-reason"
        label="Reason"
        hint="For example: delivery received, damaged bottles, stock count."
      >
        <Input id="stock-reason" name="reason" required maxLength={500} />
      </Field>
    </ActionForm>
  );
}
