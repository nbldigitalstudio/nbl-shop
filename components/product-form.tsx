import { Plus, Save } from "lucide-react";
import { upsertProduct } from "@/app/actions";
import { Button } from "@/components/button";
import { Field, Input, Textarea } from "@/components/field";
import { ImageUpload } from "@/components/image-upload";
import type { Product } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  return (
    <form action={upsertProduct} className="grid gap-4 lg:grid-cols-2">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <Field label="Name">
        <Input name="name" required defaultValue={product?.name} placeholder="Signature hoodie" />
      </Field>
      <Field label="Price">
        <Input
          name="price"
          required
          type="number"
          min="0.5"
          step="0.01"
          defaultValue={product ? product.price_cents / 100 : undefined}
          placeholder="49.99"
        />
      </Field>
      <ImageUpload name="image_url" label="Product image" defaultValue={product?.image_url} />
      <Field label="Stock">
        <Input name="stock" required type="number" min="0" defaultValue={product?.stock ?? 10} />
      </Field>
      <div className="lg:col-span-2">
        <Field label="Description">
          <Textarea name="description" defaultValue={product?.description ?? ""} placeholder="Details shoppers should know." />
        </Field>
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="size-4 accent-mint" />
        Active
      </label>
      <div className="flex lg:justify-end">
        <Button type="submit">
          {product ? <Save className="size-4" /> : <Plus className="size-4" />}
          {product ? "Save product" : "Add product"}
        </Button>
      </div>
    </form>
  );
}
