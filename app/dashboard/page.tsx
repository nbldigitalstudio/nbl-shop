import { ArrowUpRight, DollarSign, Package, ReceiptText, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { getDashboardMetrics, getMyStore, getOrders, getProducts } from "@/lib/data";
import { formatMoney } from "@/lib/utils";

export default async function DashboardPage() {
  const store = await getMyStore();

  if (!store) {
    return (
      <EmptyState
        title="Your storefront is waiting"
        text="Create your tenant, brand the store, and claim a unique public URL."
        href="/dashboard/settings"
        action="Open store builder"
      />
    );
  }

  const [metrics, orders, products] = await Promise.all([
    getDashboardMetrics(store.id),
    getOrders(store.id),
    getProducts(store.id)
  ]);

  const stats = [
    { label: "Revenue", value: formatMoney(metrics.revenueCents), icon: DollarSign },
    { label: "Orders", value: String(metrics.orderCount), icon: ReceiptText },
    { label: "Products", value: String(metrics.productCount), icon: Package },
    { label: "Average order", value: formatMoney(metrics.averageOrderCents), icon: ShoppingCart }
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink/60">{stat.label}</p>
              <stat.icon className="size-4 text-mint" />
            </div>
            <p className="mt-3 text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-black">Recent orders</h2>
            <a href="/dashboard/orders" className="flex items-center gap-1 text-sm font-bold text-mint">
              View all <ArrowUpRight className="size-4" />
            </a>
          </div>
          <div className="grid gap-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-md bg-ink/[0.03] p-3">
                <div>
                  <p className="font-semibold">{order.customer_email ?? "Guest checkout"}</p>
                  <p className="text-sm text-ink/55">{order.status}</p>
                </div>
                <p className="font-black">{formatMoney(order.amount_total_cents)}</p>
              </div>
            ))}
            {!orders.length ? <p className="text-sm text-ink/60">Orders will appear after checkout payments succeed.</p> : null}
          </div>
        </section>
        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="font-black">Inventory watch</h2>
          <div className="mt-4 grid gap-3">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-md bg-ink/[0.03] p-3">
                <span className="font-semibold">{product.name}</span>
                <span className="text-sm text-ink/60">{product.stock} left</span>
              </div>
            ))}
            {!products.length ? <p className="text-sm text-ink/60">Add products to start selling.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
