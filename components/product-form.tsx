"use client";

import { Plus, Save } from "lucide-react";
import { upsertProduct } from "@/app/actions";
import { Button } from "@/components/button";
import { Field, Input, Textarea } from "@/components/field";
import { ImageUpload } from "@/components/image-upload";
import type { Product } from "@/lib/types";

export function ProductForm({
  product,
  storeId,
}: {
  product?: Product;
  storeId?: string;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        await upsertProduct(formData);
      }}
      className="grid gap-4 lg:grid-cols-2"
    >
      {/* IDs */}
      {product && (
        <input type="hidden" name="id" value={product.id} />
      )}

      {storeId && (
        <input type="hidden" name="store_id" value={storeId} />
      )}

      {/* NAME */}
      <Field label="Name">
        <Input
          name="name"
          required
          defaultValue={product?.name ?? ""}
          placeholder="Signature hoodie"
        />
      </Field>

      {/* PRICE */}
      <Field label="Price">
        <Input
          name="price"
          required
          type="number"
          min="0"
          step="0.01"
          defaultValue={
            product ? product.price_cents / 100 : ""
          }
          placeholder="49.99"
        />
      </Field>

      {/* IMAGE */}
      <ImageUpload
        name="image_url"
        label="Product image"
        defaultValue={product?.image_url}
      />

      {/* STOCK */}
      <Field label="Stock">
        <Input
          name="stock"
          required
          type="number"
          min="0"
          defaultValue={product?.stock ?? 10}
        />
      </Field>

      {/* DESCRIPTION */}
      <div className="lg:col-span-2">
        <Field label="Description">
          <Textarea
            name="description"
            defaultValue={product?.description ?? ""}
            placeholder="Details shoppers should know."
          />
        </Field>
      </div>

      {/* ACTIVE (FIX IMPORTANTE) */}
      {/* enviamos 1/0 para evitar el error boolean vs string */}
      <input
        type="hidden"
        name="active"
        value="0"
      />

      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          name="active"
          value="1"
          defaultChecked={product?.active ?? true}
          className="size-4 accent-mint"
        />
        Active
      </label>

      {/* BUTTON */}
      <div className="flex lg:justify-end lg:col-span-2">
        <Button type="submit">
          {product ? (
            <Save className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}
          {product ? "Save product" : "Add product"}
        </Button>
      </div>
    </form>
  );
}