export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { DollarSign, Package, ReceiptText, Settings } from "lucide-react";
import { getDashboardMetrics, getOrders, getProducts, getStoreForUser } from "@/lib/data";
import { formatMoney } from "@/lib/utils";

export default async function StoreDashboardPage({
  params
}: {
  params: { storeId: string };
}) {
  const store = await getStoreForUser(params.storeId);
  if (!store) notFound();

  const [metrics, products, orders] = await Promise.all([
    getDashboardMetrics(store.id),
    getProducts(store.id),
    getOrders(store.id)
  ]);

  const stats = [
    { label: "Revenue", value: formatMoney(metrics.revenueCents), icon: DollarSign },
    { label: "Orders", value: String(metrics.orderCount), icon: ReceiptText },
    { label: "Products", value: String(products.length), icon: Package }
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-sm text-gray-500">/store/{store.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/stores/${store.id}/products`} className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white">
            Products
          </Link>
          <Link href={`/dashboard/stores/${store.id}/settings`} className="rounded-md border px-4 py-2 text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <Settings className="size-4" />
              Settings
            </span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              <stat.icon className="size-4 text-gray-500" />
            </div>
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Recent orders</h2>
        <div className="mt-4 grid gap-3">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex justify-between rounded-lg bg-gray-50 p-4">
              <span>{order.customer_email ?? "Guest"}</span>
              <strong>{formatMoney(order.amount_total_cents)}</strong>
            </div>
          ))}
          {!orders.length ? <p className="text-sm text-gray-500">No orders yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
