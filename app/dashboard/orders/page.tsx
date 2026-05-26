export const dynamic = "force-dynamic";

import { EmptyState } from "@/components/empty-state";
import { getMyStore, getOrders } from "@/lib/data";
import { formatMoney } from "@/lib/utils";

export default async function OrdersPage() {
  const store = await getMyStore();

  if (!store) {
    return <EmptyState title="No store yet" text="Orders will be scoped to the store you create." href="/dashboard/settings" action="Create store" />;
  }

  const orders = await getOrders(store.id);

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Orders</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-ink/55">
            <tr className="border-b border-ink/10">
              <th className="py-3">Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Platform fee</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-ink/5">
                <td className="py-3 font-semibold">{order.customer_email ?? "Guest"}</td>
                <td>{order.status}</td>
                <td>{formatMoney(order.amount_total_cents)}</td>
                <td>{formatMoney(order.application_fee_cents)}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length ? <p className="py-6 text-sm text-ink/60">No orders yet.</p> : null}
      </div>
    </section>
  );
}
