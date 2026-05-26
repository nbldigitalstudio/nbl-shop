"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cx } from "@/lib/utils";

export function ImageUpload({
  name,
  label,
  defaultValue,
  bucket = "store-assets"
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  bucket?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <input type="hidden" name={name} value={url} />
      <label
        className={cx(
          "focus-ring grid min-h-36 cursor-pointer place-items-center rounded-md border border-dashed border-ink/20 bg-[#fbfaf7] p-3 text-center",
          isPending && "opacity-60"
        )}
      >
        {url ? (
          <Image src={url} alt="" width={560} height={220} className="max-h-44 rounded-md object-contain" />
        ) : (
          <span className="grid justify-items-center gap-2 text-ink/55">
            <Upload className="size-5" />
            Upload image
          </span>
        )}
        <input
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            startTransition(async () => {
              setError("");
              const supabase = createSupabaseBrowserClient();
              const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
              const path = `${crypto.randomUUID()}-${safeName}`;
              const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
                cacheControl: "3600",
                upsert: false
              });

              if (uploadError) {
                setError(uploadError.message);
                return;
              }

              const { data } = supabase.storage.from(bucket).getPublicUrl(path);
              setUrl(data.publicUrl);
            });
          }}
        />
      </label>
      {error ? <p className="text-xs font-semibold text-coral">{error}</p> : null}
    </div>
  );
}
