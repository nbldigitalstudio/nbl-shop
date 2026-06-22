export const dynamic = "force-dynamic";

import { Save } from "lucide-react";
import { upsertStore } from "@/app/actions";
import { Button } from "@/components/button";
import { Field, Input, Textarea } from "@/components/field";
import { ImageUpload } from "@/components/image-upload";
import { StorePreviewCard } from "@/components/store-preview-card";
import { getMyStore } from "@/lib/data";

export default async function SettingsPage() {
  const store = await getMyStore();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500">
          Configuración de tu tienda principal.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <form action={upsertStore} className="grid gap-5 rounded-xl bg-white p-6 shadow">
          {store ? <input type="hidden" name="store_id" value={store.id} /> : null}

          <Field label="Store name">
            <Input
              name="name"
              required
              defaultValue={store?.name ?? ""}
              placeholder="NBL Essentials"
            />
          </Field>

          <Field label="URL slug">
            <Input
              name="slug"
              defaultValue={store?.slug ?? ""}
              placeholder="nbl-essentials"
            />
          </Field>

          <ImageUpload name="logo_url" label="Logo upload" defaultValue={store?.logo_url ?? ""} />
          <ImageUpload name="banner_url" label="Banner upload" defaultValue={store?.banner_url ?? ""} />

          <Field label="Theme color">
            <Input
              name="theme_color"
              type="color"
              defaultValue={store?.theme_color ?? "#18a986"}
              className="h-12 p-1"
            />
          </Field>

          <Field label="Description">
            <Textarea
              name="description"
              defaultValue={store?.description ?? ""}
              placeholder="Describe tu tienda..."
            />
          </Field>

          <Button type="submit">
            <Save className="size-4" />
            Save storefront
          </Button>
        </form>

        <StorePreviewCard store={store ?? null} />
      </div>
    </div>
  );
}
