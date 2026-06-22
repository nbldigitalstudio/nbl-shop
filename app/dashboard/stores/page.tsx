export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { getCurrentUser, getMyStores } from "@/lib/data";
import { isFounderEmail } from "@/lib/access";

export default async function StoresPage() {
  const [stores, user] = await Promise.all([getMyStores(), getCurrentUser()]);
  const isFounder = isFounderEmail(user?.email);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Stores</h1>
        <p className="text-sm text-gray-500">
          Crea y administra múltiples tiendas desde tu dashboard.
        </p>
      </div>

      {isFounder ? <section className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Crear tienda para un cliente</h2><p className="mt-1 text-sm text-gray-500">Usa el asistente para configurar negocio, propietario, plan, Stripe y preparación de envíos.</p><Link href="/dashboard/stores/new" className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-black px-4 text-sm font-semibold text-white"><Plus className="size-4" />Abrir asistente</Link></section> : null}

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Your stores</h2>
        <div className="mt-5 grid gap-3">
          {stores.map((store) => (
            <div key={store.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="font-semibold">{store.name}</p>
                <p className="text-sm text-gray-500">/store/{store.slug}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/store/${store.slug}`} className="rounded-md border px-3 py-2 text-sm font-semibold">
                  Public URL
                </Link>
                <Link href={`/dashboard/stores/${store.id}`} className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white">
                  <span className="inline-flex items-center gap-2">
                    <Settings className="size-4" />
                    Manage
                  </span>
                </Link>
              </div>
            </div>
          ))}
          {!stores.length ? <p className="text-sm text-gray-500">No stores yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
