import { z } from "zod";
import { slugify } from "@/lib/utils";

export const storeInputSchema = z.object({
  name: z.string().trim().min(2, "Store name is required.").max(80),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((value) => slugify(value || "")),
  logo_url: z.string().url().or(z.literal("")).optional(),
  banner_url: z.string().url().or(z.literal("")).optional(),
  theme_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a valid hex color."),
  description: z.string().trim().max(500).optional()
});

export const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Product name is required.").max(120),
  price: z.coerce.number().min(0.5, "Price must be at least $0.50."),
  image_url: z.string().url().or(z.literal("")).optional(),
  description: z.string().trim().max(1000).optional(),
  stock: z.coerce.number().int().min(0),
  active: z.boolean().optional()
});

export function toStorePayload(input: z.infer<typeof storeInputSchema>, ownerId: string) {
  const slug = input.slug || slugify(input.name);

  return {
    owner_id: ownerId,
    name: input.name,
    slug,
    logo_url: input.logo_url || null,
    banner_url: input.banner_url || null,
    theme_color: input.theme_color,
    description: input.description || null
  };
}

export function toProductPayload(input: z.infer<typeof productInputSchema>, storeId: string, active: boolean) {
  return {
    store_id: storeId,
    name: input.name,
    price_cents: Math.round(input.price * 100),
    image_url: input.image_url || null,
    description: input.description || null,
    stock: input.stock,
    active
  };
}
