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
        <div><h1 className="text-2xl font-bold">Resumen</h1><p className="text-sm text-gray-500">Ventas, pedidos e indicadores principales de tu tienda.</p></div>
        <Link href="/dashboard/stores" className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white">Administrar tiendas</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <div key={stat.label} className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-gray-500">{stat.label}</p><stat.icon className="size-4 text-gray-400" /></div><p className="mt-3 text-2xl font-bold">{stat.value}</p></div>)}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">Estado de Stripe</h2><CreditCard className="size-5 text-gray-400" /></div><p className={`mt-4 text-lg font-bold ${connectReady ? "text-green-600" : "text-amber-600"}`}>{connectReady ? "Listo para cobrar" : "Configuración pendiente"}</p><p className="mt-1 text-sm text-gray-500">{activeStore?.name ?? "Selecciona una tienda"}</p></section>
        <section className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">Estado del plan</h2><StoreIcon className="size-5 text-gray-400" /></div><p className="mt-4 text-lg font-bold">{activeStore ? PLANS[activeStore.plan].name : "Sin tienda"}</p><p className="mt-1 text-sm text-gray-500">{activeStore ? `${activeStore.billing_interval === "year" ? "Anual" : "Mensual"} · ${PLANS[activeStore.plan].feePercent}% por venta` : ""}</p></section>
        <section className={`rounded-xl border p-5 shadow-sm ${billingPending ? "border-amber-200 bg-amber-50" : "bg-white"}`}><div className="flex items-center justify-between"><h2 className="font-bold">Facturación</h2><AlertTriangle className={`size-5 ${billingPending ? "text-amber-600" : "text-gray-400"}`} /></div><p className={`mt-4 text-lg font-bold ${billingPending ? "text-amber-700" : "text-green-600"}`}>{billingPending ? "Pago pendiente" : "Al día"}</p><p className="mt-1 text-sm text-gray-500">La tienda permanece activa siempre.</p></section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Pedidos recientes</h2><Link href="/dashboard/orders" className="text-sm font-semibold text-blue-600">Ver todos</Link></div><div className="mt-4 divide-y">{orders.slice(0, 6).map((order) => <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p><p className="text-sm text-gray-500">{order.customer_email ?? "Cliente invitado"} · {order.stores.name}</p></div><p className="font-bold">{formatMoney(order.amount_total_cents)}</p></Link>)}{!orders.length ? <p className="py-5 text-sm text-gray-500">Aún no hay pedidos.</p> : null}</div></section>

        <section className="rounded-xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Inventario bajo</h2><AlertTriangle className="size-5 text-amber-500" /></div><div className="mt-4 divide-y">{lowStock.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold">{product.name}</p><p className="text-sm text-gray-500">{formatMoney(product.price_cents)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{product.stock} disponibles</span></div>)}{!lowStock.length ? <p className="py-5 text-sm text-gray-500">No hay productos con inventario bajo.</p> : null}</div></section>
      </div>
    </div>
  );
}
