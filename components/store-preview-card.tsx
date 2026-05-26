import Image from "next/image";
import { ExternalLink, ImageIcon, Store as StoreIcon } from "lucide-react";
import { LinkButton } from "@/components/button";
import type { Store } from "@/lib/types";

export function StorePreviewCard({ store }: { store: Store | null }) {
  const themeColor = store?.theme_color ?? "#18a986";

  return (
    <aside className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">Public preview</h2>
          <p className="mt-1 text-sm text-ink/60">{store ? `/store/${store.slug}` : "Save your store to claim a URL"}</p>
        </div>
        {store ? (
          <LinkButton href={`/store/${store.slug}`} variant="secondary" className="h-9 px-3">
            <ExternalLink className="size-4" />
            Open
          </LinkButton>
        ) : null}
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-ink/10 bg-[#fbfaf7]">
        <div className="relative grid aspect-[16/7] place-items-center bg-ink text-white">
          {store?.banner_url ? (
            <Image src={store.banner_url} alt="" fill className="object-cover opacity-70" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${themeColor}, #152020)` }} />
          )}
          <ImageIcon className="relative size-8 opacity-70" />
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-ink/10">
              {store?.logo_url ? (
                <Image src={store.logo_url} alt="" width={48} height={48} className="size-12 object-cover" />
              ) : (
                <StoreIcon className="size-5 text-ink/45" />
              )}
            </div>
            <div>
              <h3 className="font-black">{store?.name ?? "Your store name"}</h3>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-ink/60">
                {store?.description ?? "Your store description and branding will appear here."}
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
        </div>
      </div>
    </aside>
  );
}
