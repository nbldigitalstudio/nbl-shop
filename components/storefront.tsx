"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import type { Product, Store } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

type CartItem = {
  productId: string;
  quantity: number;
};

export function Storefront({ store, products }: { store: Store; products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const total = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return sum + (product?.price_cents ?? 0) * item.quantity;
      }, 0),
    [cart, products]
  );

  function add(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
        );
      }

      return [...current, { productId: product.id, quantity: 1 }];
    });
  }

  function increment(product: Product, direction: 1 | -1) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(product.stock, Math.max(0, item.quantity + direction)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function remove(productId: string) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">Products</h2>
          <span className="text-sm font-semibold text-ink/55">{products.length} available</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-lg border border-ink/10 bg-[#fbfaf7]">
              <div className="relative aspect-[4/3] bg-ink/[0.04]">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-ink/40">
                    <ShoppingBag className="size-10" />
                  </div>
                )}
              </div>
              <div className="grid gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black">{product.name}</h3>
                  <p className="font-black">{formatMoney(product.price_cents)}</p>
                </div>
                <p className="min-h-12 text-sm leading-6 text-ink/65">{product.description}</p>
                <Button type="button" className="w-full" style={{ backgroundColor: store.theme_color }} onClick={() => add(product)}>
                  Add to cart
                </Button>
              </div>
            </article>
          ))}
        </div>
        {!products.length ? <p className="rounded-lg bg-[#fbfaf7] p-6 text-sm text-ink/60">This store has no available products yet.</p> : null}
      </div>
      <aside className="h-fit rounded-lg border border-ink/10 bg-white p-5 shadow-sm lg:sticky lg:top-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Cart</h2>
          <ShoppingCart className="size-5 text-mint" />
        </div>
        <div className="mt-5 grid gap-3">
          {cart.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);
            if (!product) return null;

            return (
              <div key={item.productId} className="rounded-md bg-ink/[0.03] p-3">
                <div className="flex justify-between gap-3">
                  <p className="font-semibold">{product.name}</p>
                  <p className="font-black">{formatMoney(product.price_cents * item.quantity)}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" className="size-8 p-0" onClick={() => increment(product, -1)} aria-label="Decrease quantity">
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <Button type="button" variant="secondary" className="size-8 p-0" onClick={() => increment(product, 1)} aria-label="Increase quantity">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button type="button" variant="ghost" className="size-8 p-0" onClick={() => remove(product.id)} aria-label="Remove item">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {!cart.length ? <p className="text-sm text-ink/60">Add products to start checkout.</p> : null}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-black">{formatMoney(total)}</span>
        </div>
        <form action="/api/checkout" method="POST" className="mt-5">
          <input type="hidden" name="store_id" value={store.id} />
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <Button type="submit" disabled={!cart.length} className="w-full" style={{ backgroundColor: store.theme_color }}>
            Checkout
          </Button>
        </form>
      </aside>
    </section>
  );
}
