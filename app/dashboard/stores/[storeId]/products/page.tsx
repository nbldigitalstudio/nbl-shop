export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { ProductManagementList } from "@/components/product-management-list";
import { getProducts, getStoreForUser } from "@/lib/data";

export default async function StoreProductsPage({
  params
}: {
  params: { storeId: string };
}) {
  const store = await getStoreForUser(params.storeId);
  if (!store) notFound();

  const products = await getProducts(store.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold">Add product</h1>
        <p className="mt-1 text-sm text-gray-500">{store.name}</p>
        <div className="mt-5">
          <ProductForm storeId={store.id} />
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Products</h2>
          <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold">
            {products.length}
          </span>
        </div>
        <ProductManagementList products={products} storeId={store.id} />
      </section>
    </div>
  );
}
