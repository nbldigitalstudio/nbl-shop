import Image from "next/image";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions";
import { Button } from "@/components/button";
import { ProductForm } from "@/components/product-form";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function ProductManagementList({
  products,
  storeId
}: {
  products: Product[];
  storeId?: string;
}) {
  return (
    <div className="grid gap-4">
      {products.map((product) => (
        <details key={product.id} className="rounded-md border border-ink/10 bg-[#fbfaf7] p-4">
          <summary className="grid cursor-pointer list-none grid-cols-[64px_1fr_auto] items-center gap-4">
            <div className="relative grid size-16 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-ink/10">
              {product.image_url ? (
                <Image src={product.image_url} alt="" fill className="object-cover" />
              ) : (
                <ImageIcon className="size-5 text-ink/40" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-black">{product.name}</h3>
                <span className={product.active ? "rounded-md bg-mint/10 px-2 py-1 text-xs font-bold text-mint" : "rounded-md bg-coral/10 px-2 py-1 text-xs font-bold text-coral"}>
                  {product.active ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/60">
                {formatMoney(product.price_cents)} · {product.stock} in stock
              </p>
            </div>
            <Pencil className="size-4 text-ink/50" />
          </summary>
          <div className="mt-5 border-t border-ink/10 pt-5">
            <ProductForm product={product} storeId={storeId} />
            <form action={deleteProduct} className="mt-3">
              <input type="hidden" name="id" value={product.id} />
              {storeId ? <input type="hidden" name="store_id" value={storeId} /> : null}
              <Button type="submit" variant="danger">
                <Trash2 className="size-4" />
                Delete product
              </Button>
            </form>
          </div>
        </details>
      ))}
      {!products.length ? <p className="text-sm text-ink/60">No products yet.</p> : null}
    </div>
  );
}
