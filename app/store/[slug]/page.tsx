export const dynamic = "force-dynamic";

import Image from "next/image";
import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront";
import { getProducts, getStoreBySlug } from "@/lib/data";

export default async function StorePage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { checkout?: string; message?: string };
}) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    notFound();
  }

  const products = await getProducts(store.id, true);

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="relative min-h-[38vh] overflow-hidden bg-[#4b3542] text-white">
        {store.banner_url ? (
          <Image src={store.banner_url} alt="" fill priority className="object-cover opacity-50" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${store.theme_color}, #4b3542 70%, #6c4d65)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="relative mx-auto flex min-h-[38vh] max-w-7xl flex-col justify-end px-4 py-12 sm:px-6 lg:px-8">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt={`${store.name} logo`}
              width={64}
              height={64}
              className="mb-4 rounded-2xl bg-white object-cover p-1 shadow-xl"
            />
          ) : null}
          <p className="mb-2 text-xs font-black uppercase tracking-[.22em] text-white/70">Bienvenidos a nuestra tienda</p><h1 className="text-4xl font-black sm:text-5xl">{store.name}</h1>
          {store.description ? (
            <p className="mt-3 max-w-2xl text-white/80">{store.description}</p>
          ) : null}
        </div>
      </section>

      {searchParams.checkout === "error" ? (
        <p className="mx-auto mt-6 max-w-7xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {searchParams.message || "Checkout could not be started. Please try again."}
        </p>
      ) : null}

      <Storefront store={store} products={products} />
    </main>
  );
}
