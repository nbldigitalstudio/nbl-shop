export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getStoresWithPendingBilling } from "@/lib/data";
import { isFounderEmail } from "@/lib/access";
import { SignOutButton } from "@/components/sign-out-button";
import { Boxes, CircleHelp, CreditCard, Heart, LayoutDashboard, ReceiptText, Settings, Store } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "Mis tiendas", icon: Store },
  { href: "/dashboard/products", label: "Productos", icon: Boxes },
  { href: "/dashboard/orders", label: "Pedidos", icon: ReceiptText },
  { href: "/dashboard/billing", label: "Planes y pagos", icon: CreditCard },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
  { href: "/help", label: "Ayuda", icon: CircleHelp }
];

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
    <div className="flex min-h-screen bg-[#fffaf7]">
      <aside className="hidden w-72 flex-col border-r border-rose-100 bg-[#4b3542] p-5 text-white lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-3 text-xl font-black"><span className="grid size-10 place-items-center rounded-2xl bg-rose-400 text-white">N</span>NBL SHOP</Link>

        <nav className="flex flex-col gap-1.5 text-sm">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-rose-50/80 transition hover:bg-white/10 hover:text-white"><item.icon className="size-4" />{item.label}</Link>)}
        </nav>
        <div className="mt-auto rounded-2xl bg-white/10 p-4"><Heart className="size-5 fill-rose-300 text-rose-300" /><p className="mt-3 text-sm font-bold">Tu negocio importa.</p><p className="mt-1 text-xs leading-5 text-rose-100/70">Estamos aquí para acompañarte mientras crece.</p></div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-rose-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-rose-500">Tu espacio de trabajo</p><p className="font-bold">NBL Shop Dashboard</p></div>
          <nav className="order-3 flex w-full gap-2 overflow-x-auto pb-1 lg:hidden">{navigation.slice(0, 5).map((item) => <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold">{item.label}</Link>)}</nav>
          <SignOutButton />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {pendingBillingStores.length ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              Tu pago está pendiente. Tu tienda sigue activa. Por favor actualiza tu método de pago.
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
