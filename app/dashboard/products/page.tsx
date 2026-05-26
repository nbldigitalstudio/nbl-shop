import { EmptyState } from "@/components/empty-state";
import { ProductForm } from "@/components/product-form";
import { ProductManagementList } from "@/components/product-management-list";
import { getMyStore, getProducts } from "@/lib/data";

export default async function ProductsPage() {
  const store = await getMyStore();

  if (!store) {
    return (
      <EmptyState
        title="Create your store first"
        text="Products belong to a store tenant, so set up your storefront before adding inventory."
        href="/dashboard/settings"
        action="Open store builder"
      />
    );
  }

  const products = await getProducts(store.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Add product</h2>
        <div className="mt-5">
          <ProductForm />
        </div>
      </section>
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">Products</h2>
          <span className="rounded-md bg-ink/[0.04] px-3 py-1 text-sm font-bold">{products.length}</span>
        </div>
        <ProductManagementList products={products} />
      </section>
    </div>
  );
}
