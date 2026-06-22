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
    <main className="min-h-screen bg-white">
      <section className="relative min-h-[34vh] overflow-hidden bg-black text-white">
        {store.banner_url ? (
          <Image src={store.banner_url} alt="" fill priority className="object-cover opacity-50" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${store.theme_color}, #111827)` }}
          />
        )}
        <div className="relative mx-auto flex min-h-[34vh] max-w-7xl flex-col justify-end px-4 py-10 sm:px-6 lg:px-8">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt={`${store.name} logo`}
              width={64}
              height={64}
              className="mb-4 rounded-md bg-white object-cover p-1"
            />
          ) : null}
          <h1 className="text-4xl font-black">{store.name}</h1>
          {store.description ? (
            <p className="mt-3 max-w-2xl text-white/80">{store.description}</p>
          ) : null}
        </div>
      </section>

      {searchParams.checkout === "error" ? (
        <p className="mx-auto mt-6 max-w-7xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {searchParams.message || "Checkout could not be started. Please try again."}
        </p>
      ) : null}

      <Storefront store={store} products={products} />
    </main>
  );
}
