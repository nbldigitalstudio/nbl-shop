export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChevronRight, CircleDollarSign, PackageCheck, ReceiptText, Truck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { getMyOrders, getMyStores } from "@/lib/data";
import type { Order } from "@/lib/types";
import { cx, formatMoney } from "@/lib/utils";

const filters = [
  { value: "all", label: "Todas" },
  { value: "paid", label: "Pagadas" },
  { value: "pending", label: "Pendientes" },
  { value: "fulfilled", label: "Enviadas" }
];

function statusLabel(order: Order) {
  if (order.status === "fulfilled" || order.shipping_status === "shipped") return "Enviada";
  if (order.payment_status === "paid") return "Pagada";
  if (order.status === "refunded") return "Reembolsada";
  return "Pendiente";
}

function statusStyle(order: Order) {
  if (order.status === "fulfilled" || order.shipping_status === "shipped") return "bg-blue-50 text-blue-700 ring-blue-600/20";
  if (order.payment_status === "paid") return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (order.status === "refunded") return "bg-gray-100 text-gray-700 ring-gray-500/20";
  return "bg-amber-50 text-amber-700 ring-amber-600/20";
}

export default async function OrdersPage({
  searchParams
}: {
  searchParams?: { status?: string };
}) {
  const [stores, orders] = await Promise.all([getMyStores(), getMyOrders()]);

  if (!stores.length) {
    return <EmptyState title="Aún no tienes una tienda" text="Crea una tienda para comenzar a recibir pedidos." href="/dashboard/stores" action="Crear tienda" />;
  }

  const selectedFilter = filters.some((filter) => filter.value === searchParams?.status)
    ? searchParams?.status ?? "all"
    : "all";
  const visibleOrders = orders.filter((order) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "paid") return order.payment_status === "paid" && order.shipping_status !== "shipped";
    if (selectedFilter === "fulfilled") return order.status === "fulfilled" || order.shipping_status === "shipped";
    return order.payment_status !== "paid";
  });
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const revenueCents = paidOrders.reduce((total, order) => total + order.amount_total_cents, 0);
  const readyToShip = paidOrders.filter((order) => order.shipping_status === "pending").length;

  const stats = [
    { label: "Pedidos", value: String(orders.length), icon: ReceiptText },
    { label: "Ventas pagadas", value: formatMoney(revenueCents), icon: CircleDollarSign },
    { label: "Por preparar", value: String(readyToShip), icon: Truck },
    { label: "Enviados", value: String(orders.filter((order) => order.shipping_status === "shipped").length), icon: PackageCheck }
  ];

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gray-500">Ventas</p>
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="mt-1 text-sm text-gray-500">Revisa pagos, clientes y el estado de preparación de tus órdenes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <stat.icon className="size-4 text-gray-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Link
                key={filter.value}
                href={filter.value === "all" ? "/dashboard/orders" : `/dashboard/orders?status=${filter.value}`}
                className={cx(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                  selectedFilter === filter.value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-500">{visibleOrders.length} {visibleOrders.length === 1 ? "pedido" : "pedidos"}</p>
        </div>

        {visibleOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Pedido</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Tienda</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3"><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">#{order.id.slice(0, 8).toUpperCase()}</Link>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{order.customer_email ?? "Cliente invitado"}</td>
                    <td className="px-5 py-4 text-gray-600">{order.stores.name}</td>
                    <td className="px-5 py-4">
                      <span className={cx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", statusStyle(order))}>{statusLabel(order)}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatMoney(order.amount_total_cents)}</td>
                    <td className="px-5 py-4 text-gray-500">{new Intl.DateTimeFormat("es-PR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Puerto_Rico" }).format(new Date(order.created_at))}</td>
                    <td className="px-5 py-4 text-right"><Link href={`/dashboard/orders/${order.id}`} aria-label="Ver pedido" className="inline-flex rounded-md p-2 text-gray-400 hover:bg-white hover:text-gray-900"><ChevronRight className="size-4" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <ReceiptText className="mx-auto size-8 text-gray-300" />
            <p className="mt-3 font-semibold">No hay pedidos en este estado</p>
            <p className="mt-1 text-sm text-gray-500">Cuando lleguen, aparecerán aquí automáticamente.</p>
          </div>
        )}
      </section>
    </div>
  );
}
