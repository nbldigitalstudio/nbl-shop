import Image from "next/image";
import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront";
import { getProducts, getStoreBySlug } from "@/lib/data";

export default async function PublicStorePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = await getStoreBySlug(params.slug);

  if (!store) {
    notFound();
  }

  // 🔥 FIX: asegurar tipo seguro y evitar error TS
  const products = await getProducts(store.id, true);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative min-h-[42vh] overflow-hidden bg-ink text-white">
        {store.banner_url ? (
          <Image
            src={store.banner_url}
            alt=""
            fill
            priority
            className="object-cover opacity-45"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${store.theme_color}, #152020)`,
            }}
          />
        )}

        <div className="relative mx-auto flex min-h-[42vh] max-w-7xl flex-col justify-end px-4 py-10 sm:px-6 lg:px-8">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt={`${store.name} logo`}
              width={72}
              height={72}
              className="mb-5 rounded-md bg-white object-cover p-1"
            />
          ) : null}

          <h1 className="max-w-3xl text-4xl font-black sm:text-6xl">
            {store.name}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-white/80">
            {store.description}
          </p>
        </div>
      </section>

      <Storefront store={store} products={products} />
    </main>
  );
}