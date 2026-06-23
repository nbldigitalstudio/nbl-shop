export const dynamic = "force-dynamic";

import Link from "next/link";
import { AlertTriangle, CalendarDays, CreditCard, DollarSign, Package, ReceiptText, Store as StoreIcon } from "lucide-react";
import { getMyOrders, getMyStores, getProducts } from "@/lib/data";
import { PLANS } from "@/lib/plans";
import { formatMoney } from "@/lib/utils";

export default async function DashboardPage() {
  const stores = await getMyStores();
  const [orders, productGroups] = await Promise.all([
    getMyOrders(),
    Promise.all(stores.map((store) => getProducts(store.id)))
  ]);
  const products = productGroups.flat();
  const activeStore = stores[0] ?? null;
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todaySales = paidOrders.filter((order) => new Date(order.created_at) >= startOfToday).reduce((total, order) => total + order.amount_total_cents, 0);
  const monthSales = paidOrders.filter((order) => new Date(order.created_at) >= startOfMonth).reduce((total, order) => total + order.amount_total_cents, 0);
  const lowStock = products.filter((product) => product.active && product.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 8);
  const connectReady = !!activeStore?.stripe_charges_enabled && !!activeStore?.stripe_payouts_enabled;
  const billingPending = activeStore && ["past_due", "unpaid", "incomplete"].includes(activeStore.billing_status);

  const stats = [
    { label: "Ventas de hoy", value: formatMoney(todaySales), icon: DollarSign },
    { label: "Ventas del mes", value: formatMoney(monthSales), icon: CalendarDays },
    { label: "Pedidos pagados", value: String(paidOrders.length), icon: ReceiptText },
    { label: "Productos", value: String(products.length), icon: Package }
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-black uppercase tracking-[.16em] text-rose-500">Todo va tomando forma</p><h1 className="mt-1 text-3xl font-black">Hola, emprendedora ✨</h1><p className="mt-1 text-sm text-stone-500">Aquí tienes una mirada clara a lo que está pasando en tu negocio.</p></div>
        <Link href="/dashboard/stores" className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-200">Administrar tiendas</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => <div key={stat.label} className={`rounded-2xl border p-5 shadow-sm ${index === 0 ? "border-rose-100 bg-rose-50/60" : index === 1 ? "border-violet-100 bg-violet-50/60" : "border-stone-100 bg-white"}`}><div className="flex items-center justify-between"><p className="text-sm font-semibold text-stone-500">{stat.label}</p><span className="grid size-9 place-items-center rounded-xl bg-white text-rose-500 shadow-sm"><stat.icon className="size-4" /></span></div><p className="mt-3 text-2xl font-black">{stat.value}</p></div>)}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">Estado de Stripe</h2><CreditCard className="size-5 text-emerald-500" /></div><p className={`mt-4 text-lg font-bold ${connectReady ? "text-emerald-700" : "text-amber-600"}`}>{connectReady ? "Listo para cobrar" : "Configuración pendiente"}</p><p className="mt-1 text-sm text-stone-500">{activeStore?.name ?? "Selecciona una tienda"}</p></section>
        <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">Tu plan</h2><StoreIcon className="size-5 text-violet-500" /></div><p className="mt-4 text-lg font-bold">{activeStore ? PLANS[activeStore.plan].name : "Sin tienda"}</p><p className="mt-1 text-sm text-stone-500">{activeStore ? `${activeStore.billing_interval === "year" ? "Anual" : "Mensual"} · Sin comisión por venta` : ""}</p></section>
        <section className={`rounded-2xl border p-5 shadow-sm ${billingPending ? "border-amber-200 bg-amber-50" : "border-rose-100 bg-rose-50/40"}`}><div className="flex items-center justify-between"><h2 className="font-bold">Facturación</h2><AlertTriangle className={`size-5 ${billingPending ? "text-amber-600" : "text-rose-400"}`} /></div><p className={`mt-4 text-lg font-bold ${billingPending ? "text-amber-700" : "text-emerald-700"}`}>{billingPending ? "Pago pendiente" : "Todo al día"}</p><p className="mt-1 text-sm text-stone-500">Tu tienda permanece activa siempre.</p></section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Pedidos recientes</h2><p className="text-sm text-stone-400">Cada pedido cuenta una pequeña historia.</p></div><Link href="/dashboard/orders" className="text-sm font-semibold text-rose-600">Ver todos</Link></div><div className="mt-4 divide-y divide-stone-100">{orders.slice(0, 6).map((order) => <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p><p className="text-sm text-stone-500">{order.customer_email ?? "Cliente invitado"} · {order.stores.name}</p></div><p className="font-bold">{formatMoney(order.amount_total_cents)}</p></Link>)}{!orders.length ? <p className="py-5 text-sm text-stone-500">Tus primeros pedidos aparecerán aquí.</p> : null}</div></section>

        <section className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Inventario bajo</h2><p className="text-sm text-stone-400">Para que nada te tome por sorpresa.</p></div><AlertTriangle className="size-5 text-amber-500" /></div><div className="mt-4 divide-y divide-stone-100">{lowStock.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold">{product.name}</p><p className="text-sm text-stone-500">{formatMoney(product.price_cents)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock === 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{product.stock} disponibles</span></div>)}{!lowStock.length ? <p className="py-5 text-sm text-stone-500">Todo está bien abastecido por ahora.</p> : null}</div></section>
      </div>
    </div>
  );
}
