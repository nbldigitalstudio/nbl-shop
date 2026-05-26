import Link from "next/link";
import { BarChart3, Boxes, CreditCard, Home, LayoutDashboard, ReceiptText, Settings } from "lucide-react";
import { getMyStore } from "@/lib/data";
import { LinkButton } from "@/components/button";
import { SignOutButton } from "@/components/sign-out-button";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/orders", label: "Orders", icon: ReceiptText },
  { href: "/dashboard/products", label: "Products", icon: Boxes },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Store builder", icon: Settings }
];

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const store = await getMyStore();

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink/10 bg-white px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 px-2 text-lg font-black">
          <span className="grid size-9 place-items-center rounded-md bg-ink text-white">N</span>
          NBL Shop
        </Link>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-ink/5 hover:text-ink"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Seller console</p>
              <h1 className="text-xl font-black">{store?.name ?? "Create your store"}</h1>
            </div>
            <div className="flex items-center gap-2">
              {store ? (
                <LinkButton href={`/store/${store.slug}`} variant="secondary">
                  <Home className="size-4" />
                  View store
                </LinkButton>
              ) : null}
              <LinkButton href="/dashboard/settings">Setup</LinkButton>
              <SignOutButton />
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
