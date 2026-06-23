"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/button";
import type { Product, Store } from "@/lib/types";
import { calculateShippingAmountCents } from "@/lib/shipping";
import { formatMoney } from "@/lib/utils";

type CartItem = {
  productId: string;
  quantity: number;
};

export function Storefront({ store, products }: { store: Store; products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const subtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = products.find((candidate) => candidate.id === item.productId);
        return sum + (product?.price_cents ?? 0) * item.quantity;
      }, 0),
    [cart, products]
  );
  const shipping = cart.length ? calculateShippingAmountCents(subtotal) : 0;
  const total = subtotal + shipping;

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
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-rose-500">Hecho y elegido para ti</p><h2 className="mt-1 text-3xl font-black">Nuestros productos</h2></div>
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink/55 shadow-sm">{products.length} disponibles</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-[1.5rem] border border-stone-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="relative aspect-[4/3] bg-ink/[0.04]">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-ink/40">
                    <ShoppingBag className="size-10" />
                  </div>
                )}
              </div>
              <div className="grid gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black">{product.name}</h3>
                  <p className="font-black">{formatMoney(product.price_cents)}</p>
                </div>
                <p className="min-h-12 text-sm leading-6 text-ink/65">{product.description}</p>
                <Button type="button" className="w-full" style={{ backgroundColor: store.theme_color }} onClick={() => add(product)}>
                  Añadir al carrito
                </Button>
              </div>
            </article>
          ))}
        </div>
        {!products.length ? <p className="rounded-2xl bg-white p-6 text-sm text-ink/60 shadow-sm">Esta tienda está preparando sus primeros productos.</p> : null}
      </div>
      <aside className="h-fit rounded-[1.5rem] border border-rose-100 bg-white p-6 shadow-soft lg:sticky lg:top-5">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-black uppercase tracking-wider text-rose-500">Tu selección</p><h2 className="text-xl font-black">Carrito</h2></div>
          <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-500"><ShoppingCart className="size-5" /></span>
        </div>
        <div className="mt-5 grid gap-3">
          {cart.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);
            if (!product) return null;

            return (
              <div key={item.productId} className="rounded-xl bg-stone-50 p-3">
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
          {!cart.length ? <p className="rounded-xl bg-stone-50 p-4 text-sm leading-6 text-ink/60">Añade algo que te encante para comenzar tu compra.</p> : null}
        </div>
        <div className="mt-5 grid gap-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink/65">Subtotal</span>
            <span className="font-semibold">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink/65">Shipping</span>
            <span className="font-semibold">{cart.length ? formatMoney(shipping) : "—"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-ink/10 pt-3">
            <span className="font-semibold">Total de tu compra</span>
            <span className="text-xl font-black">{formatMoney(total)}</span>
          </div>
        </div>
        <form action="/api/checkout" method="POST" className="mt-5">
          <input type="hidden" name="store_id" value={store.id} />
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <Button type="submit" disabled={!cart.length} className="w-full" style={{ backgroundColor: store.theme_color }}>
            Ir a pagar de forma segura
          </Button>
        </form>
        <p className="mt-3 text-center text-xs text-stone-400">Pago seguro procesado por Stripe</p>
      </aside>
    </section>
  );
}
