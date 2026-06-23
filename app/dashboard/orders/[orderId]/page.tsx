export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, ExternalLink, Mail, MapPin, Package, Ship, Truck } from "lucide-react";
import { updateOrderShipping } from "@/app/actions";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/field";
import { getOrderForUser } from "@/lib/data";
import { formatMoney } from "@/lib/utils";

export default async function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const order = await getOrderForUser(params.orderId);
  if (!order) notFound();

  const isPaid = order.payment_status === "paid";
  const isShipped = order.shipping_status === "shipped" || order.status === "fulfilled";
  const itemCount = order.order_items.reduce((total, item) => total + item.quantity, 0);
  const itemSubtotal = order.order_items.reduce(
    (total, item) => total + item.unit_amount_cents * item.quantity,
    0
  );
  const subtotal = order.subtotal_cents ?? itemSubtotal;
  const shippingAmount = order.shipping_amount_cents ?? Math.max(order.amount_total_cents - subtotal, 0);

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
          <ArrowLeft className="size-4" /> Volver a pedidos
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Pedido #{order.id.slice(0, 8).toUpperCase()}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${isPaid ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}`}>{isPaid ? "Pagado" : "Pago pendiente"}</span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${isShipped ? "bg-blue-50 text-blue-700 ring-blue-600/20" : "bg-gray-100 text-gray-700 ring-gray-500/20"}`}>{isShipped ? "Enviado" : "Por preparar"}</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{new Intl.DateTimeFormat("es-PR", { dateStyle: "long", timeStyle: "short", timeZone: "America/Puerto_Rico" }).format(new Date(order.created_at))} · {order.stores.name}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-right">
            <a href={`/api/orders/${order.id}/shipping/export`} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-600">
              <Download className="size-4" /> Exportar para Pirate Ship
            </a>
            <a href="https://ship.pirateship.com/ship" target="_blank" rel="noreferrer" className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-stone-200 transition hover:bg-rose-50">
              <Ship className="size-4" /> Abrir Pirate Ship
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-start gap-6">
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="font-bold">Productos</h2>
                <p className="text-sm text-gray-500">{itemCount} {itemCount === 1 ? "artículo" : "artículos"}</p>
              </div>
              <Package className="size-5 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-100">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.products?.name ?? "Producto eliminado"}</p>
                    <p className="text-sm text-gray-500">{formatMoney(item.unit_amount_cents)} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatMoney(item.unit_amount_cents * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
              <div className="mt-2 flex justify-between text-sm text-gray-600"><span>Shipping cobrado</span><span>{formatMoney(shippingAmount)}</span></div>
              <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-bold"><span>Total</span><span>{formatMoney(order.amount_total_cents)}</span></div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`mt-0.5 size-5 ${isPaid ? "text-emerald-600" : "text-amber-500"}`} />
              <div className="flex-1">
                <h2 className="font-bold">Pago {isPaid ? "confirmado" : "pendiente"}</h2>
                <p className="mt-1 text-sm text-gray-500">Stripe Checkout {order.stripe_checkout_session_id ? "registró esta transacción correctamente" : "aún no ha registrado una sesión"}.</p>
                {order.stripe_checkout_session_id ? <p className="mt-3 break-all rounded-lg bg-gray-50 px-3 py-2 font-mono text-xs text-gray-500">{order.stripe_checkout_session_id}</p> : null}
              </div>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Cliente</h2>
            <div className="mt-4 flex items-start gap-3 text-sm">
              <Mail className="mt-0.5 size-4 text-gray-400" />
              <div><p className="font-medium">{order.shipping_name ?? "Cliente invitado"}</p><p className="mt-1 break-all text-gray-500">{order.customer_email ?? "Sin correo"}</p></div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="font-bold">Dirección de envío</h2><MapPin className="size-4 text-gray-400" /></div>
            {order.shipping_address ? (
              <address className="mt-4 text-sm not-italic leading-6 text-gray-600">
                <span className="font-medium text-gray-900">{order.shipping_name}</span><br />
                {order.shipping_address}<br />
                {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
                {order.shipping_country}
              </address>
            ) : <p className="mt-4 text-sm text-gray-500">Esta orden no tiene una dirección registrada.</p>}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="font-bold">Estado de envío</h2><Truck className="size-4 text-gray-400" /></div>
            <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
              <p className="font-semibold">{isShipped ? "Enviado" : "Por preparar"}</p>
              {order.tracking_number ? <p className="mt-1 text-gray-500">Tracking: {order.tracking_number}</p> : <p className="mt-1 text-gray-500">Aún no hay tracking registrado.</p>}
              {order.shipping_carrier ? <p className="mt-1 text-gray-500">{order.shipping_carrier}{order.shipping_service ? ` · ${order.shipping_service}` : ""}</p> : null}
              {order.shipping_label_url ? <a href={order.shipping_label_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold text-blue-600 hover:underline">Ver etiqueta <ExternalLink className="ml-1 size-3.5" /></a> : null}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Crear etiqueta en Pirate Ship</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">Descarga el CSV, súbelo a Pirate Ship, compra la etiqueta y luego pega el tracking aquí.</p>
            <div className="mt-4 grid gap-2">
              <a href={`/api/orders/${order.id}/shipping/export`} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition hover:bg-rose-600">
                <Download className="size-4" /> Exportar CSV
              </a>
              <a href="https://ship.pirateship.com/ship" target="_blank" rel="noreferrer" className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-stone-200 transition hover:bg-rose-50">
                <ExternalLink className="size-4" /> Abrir Pirate Ship
              </a>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Agregar tracking</h2>
            <form action={updateOrderShipping} className="mt-4 grid gap-3">
              <input type="hidden" name="order_id" value={order.id} />
              <Field label="Carrier">
                <Input name="carrier" required defaultValue={order.shipping_carrier ?? ""} placeholder="USPS, UPS..." />
              </Field>
              <Field label="Servicio">
                <Input name="service" defaultValue={order.shipping_service ?? ""} placeholder="Ground Advantage, Priority Mail..." />
              </Field>
              <Field label="Tracking number">
                <Input name="tracking_number" required defaultValue={order.tracking_number ?? ""} />
              </Field>
              <Field label="URL de etiqueta (opcional)">
                <Input name="shipping_label_url" type="url" defaultValue={order.shipping_label_url ?? ""} placeholder="https://..." />
              </Field>
              <Button type="submit"><Truck className="size-4" /> Marcar como enviado</Button>
            </form>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Tienda</h2>
            <p className="mt-3 text-sm font-medium">{order.stores.name}</p>
            <Link href={`/store/${order.stores.slug}`} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">Ver tienda <ExternalLink className="size-3.5" /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
