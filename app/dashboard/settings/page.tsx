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
        <h2 className="text-2xl font-black">Store builder</h2>
        <p className="mt-1 text-sm text-ink/60">Create your tenant, brand it, and publish at a unique store URL.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <form action={upsertStore} className="grid gap-5 rounded-lg border border-ink/10 bg-white p-5 shadow-sm lg:grid-cols-2">
          <Field label="Store name">
            <Input name="name" required defaultValue={store?.name} placeholder="NBL Essentials" />
          </Field>
          <Field label="URL slug">
            <Input name="slug" defaultValue={store?.slug} placeholder="nbl-essentials" />
          </Field>
          <ImageUpload name="logo_url" label="Logo upload" defaultValue={store?.logo_url} />
          <ImageUpload name="banner_url" label="Banner upload" defaultValue={store?.banner_url} />
          <Field label="Theme color">
            <Input name="theme_color" type="color" defaultValue={store?.theme_color ?? "#18a986"} className="h-12 p-1" />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Description">
              <Textarea name="description" defaultValue={store?.description ?? ""} placeholder="Tell shoppers what your store is about." />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">
              <Save className="size-4" />
              Save storefront
            </Button>
          </div>
        </form>
        <StorePreviewCard store={store} />
      </div>
    </div>
  );
}
