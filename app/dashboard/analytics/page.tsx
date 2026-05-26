import { getDashboardMetrics, getMyStore, getOrders } from "@/lib/data";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/utils";

export default async function AnalyticsPage() {
  const store = await getMyStore();
  if (!store) {
    return <EmptyState title="Analytics need a store" text="Create a storefront and your sales metrics will appear here." href="/dashboard/settings" action="Create store" />;
  }

  const [metrics, orders] = await Promise.all([getDashboardMetrics(store.id), getOrders(store.id)]);
  const maxOrder = Math.max(...orders.map((order) => order.amount_total_cents), 1);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Sales analytics</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-md bg-ink/[0.03] p-4">
            <p className="text-sm text-ink/60">Revenue</p>
            <p className="mt-2 text-2xl font-black">{formatMoney(metrics.revenueCents)}</p>
          </div>
          <div className="rounded-md bg-ink/[0.03] p-4">
            <p className="text-sm text-ink/60">Paid orders</p>
            <p className="mt-2 text-2xl font-black">{metrics.orderCount}</p>
          </div>
          <div className="rounded-md bg-ink/[0.03] p-4">
            <p className="text-sm text-ink/60">Average order</p>
            <p className="mt-2 text-2xl font-black">{formatMoney(metrics.averageOrderCents)}</p>
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="font-black">Order value trend</h2>
        <div className="mt-5 grid h-64 grid-cols-12 items-end gap-2">
          {orders.slice(0, 12).reverse().map((order) => (
            <div key={order.id} className="grid h-full items-end">
              <div
                className="rounded-t-md bg-mint"
                style={{ height: `${Math.max(8, (order.amount_total_cents / maxOrder) * 100)}%` }}
                title={formatMoney(order.amount_total_cents)}
              />
            </div>
          ))}
        </div>
        {!orders.length ? <p className="mt-4 text-sm text-ink/60">Checkout activity will populate this chart.</p> : null}
      </section>
    </div>
  );
}
