export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getStoresWithPendingBilling } from "@/lib/data";
import { isFounderEmail } from "@/lib/access";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const pendingBillingStores = isFounderEmail(user.email) ? [] : await getStoresWithPendingBilling();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="flex w-72 flex-col bg-[#111827] p-5 text-white">
        <h1 className="mb-8 text-xl font-bold">NBL SHOP</h1>

        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/dashboard" className="hover:text-blue-400">
            Overview
          </Link>
          <Link href="/dashboard/stores" className="hover:text-blue-400">
            Stores
          </Link>
          <Link href="/dashboard/products" className="hover:text-blue-400">
            Products
          </Link>
          <Link href="/dashboard/orders" className="hover:text-blue-400">
            Orders
          </Link>
          <Link href="/dashboard/billing" className="hover:text-blue-400">
            Billing
          </Link>
          <Link href="/dashboard/settings" className="hover:text-blue-400">
            Settings
          </Link>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <p className="font-semibold">Dashboard</p>
          <SignOutButton />
        </header>

        <main className="p-6">
          {pendingBillingStores.length ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              Tu pago está pendiente. Tu tienda sigue activa. Por favor actualiza tu método de pago.
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
