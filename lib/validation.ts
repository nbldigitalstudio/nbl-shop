import { z } from "zod";

/* =========================
   STORE
========================= */

export const storeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  banner_url: z.string().optional().nullable(),
  theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#18a986"),
});

export const founderStoreWizardSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(2).max(80),
  logo_url: z.string().url().optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional(),
  owner_name: z.string().trim().min(2).max(100),
  owner_email: z.string().trim().email(),
  owner_phone: z.string().trim().max(30).optional(),
  plan: z.enum(["basic", "pro"]),
  billing_interval: z.enum(["month", "year"]),
  promo_code: z.string().trim().max(100).optional()
});

/* =========================
   PRODUCT
========================= */

export const productInputSchema = z.object({
  id: z.string().optional(),
  store_id: z.string().optional(),

  name: z.string().min(1),

  // 👇 IMPORTANTE: el form manda string → esto lo corrige
  price: z.coerce.number().min(0.5),

  stock: z.coerce.number().int().min(0),

  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),

  // 🔥 FIX IMPORTANTE (ANTES ESTABA BIEN PERO INCOMPLETO)
  active: z
    .preprocess((val) => {
      if (val === "on" || val === "1" || val === "true" || val === true) {
        return true;
      }
      return false;
    }, z.boolean()),
});

/* =========================
   PAYLOAD HELPERS
========================= */

export function toStorePayload(data: any, userId: string) {
  return {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    logo_url: data.logo_url || null,
    banner_url: data.banner_url || null,
    theme_color: data.theme_color,
    owner_id: userId,
  };
}

/* 🔥 FIX CLAVE: asegura consistencia con DB */
export function toProductPayload(
  data: any,
  storeId: string,
  active: boolean = data.active
) {
  return {
    store_id: storeId,
    name: data.name,
    price_cents: Math.round(Number(data.price) * 100),
    stock: Number(data.stock),
    description: data.description ?? null,
    image_url: data.image_url ?? null,
    active,
  };
}
