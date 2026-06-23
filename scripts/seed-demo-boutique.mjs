import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);

async function readEnvFile(name) {
  try {
    const raw = await readFile(new URL(name, root), "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
          return [key, value];
        })
    );
  } catch {
    return {};
  }
}

const env = {
  ...(await readEnvFile(".env.local")),
  ...process.env,
};

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const founderEmail = (env.FOUNDER_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)[0];

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

async function request(path, options = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function authRequest(path) {
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`GET auth/${path} failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function findOwnerProfile() {
  if (founderEmail) {
    const profiles = await request(
      `profiles?select=id,email,full_name&email=eq.${encodeURIComponent(founderEmail)}&limit=1`
    );
    if (profiles[0]) return profiles[0];
  }

  const profiles = await request("profiles?select=id,email,full_name&order=created_at.asc&limit=1");
  if (profiles[0]) return profiles[0];

  const usersPayload = await authRequest("admin/users?page=1&per_page=100");
  const users = usersPayload.users ?? [];
  const founderUser = founderEmail
    ? users.find((user) => user.email?.toLowerCase() === founderEmail)
    : null;
  const user = founderUser ?? users[0];

  if (!user) {
    throw new Error("No auth user found. Log in once before seeding the demo store.");
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  };
}

const owner = await findOwnerProfile();

const [store] = await request("stores?on_conflict=slug", {
  method: "POST",
  headers: {
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify({
    owner_id: owner.id,
    name: "Demo Boutique",
    slug: "demo-boutique",
    theme_color: "#d85f7a",
    description:
      "Una boutique demo creada para mostrar cómo NBL Shop ayuda a pequeños negocios a vender online de una forma cálida, clara y profesional.",
    category: "Boutique & lifestyle",
    owner_name: owner.full_name ?? "NBL Shop Demo",
    owner_email: owner.email,
    owner_phone: "",
    plan: "pro",
    billing_status: "active",
    billing_interval: "year",
    theme_settings: {
      mood: "warm",
      accent: "coral",
      demo: true,
    },
    social_links: {
      instagram: "https://instagram.com/nblshop",
    },
    contact_info: {
      email: owner.email,
      city: "San Juan",
      state: "PR",
    },
    categories: ["Velas", "Accesorios", "Papelería", "Regalos"],
  }),
});

await request("store_members?on_conflict=store_id,user_id", {
  method: "POST",
  headers: {
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify({
    store_id: store.id,
    user_id: owner.id,
    role: "owner",
  }),
});

const products = [
  {
    name: "Coral Glow Candle",
    price_cents: 1800,
    stock: 24,
    description: "Vela artesanal con aroma suave y empaque listo para regalo.",
  },
  {
    name: "Soft Linen Tote",
    price_cents: 3400,
    stock: 18,
    description: "Bolso de lino para uso diario, ligero, bonito y práctico.",
  },
  {
    name: "Bloom Journal",
    price_cents: 2200,
    stock: 30,
    description: "Journal minimalista para planificar ideas, metas y nuevos comienzos.",
  },
  {
    name: "Sunday Self-Care Box",
    price_cents: 5800,
    stock: 12,
    description: "Caja de regalo con detalles pensados para una tarde de descanso.",
  },
  {
    name: "Minimal Gold Necklace",
    price_cents: 4200,
    stock: 15,
    description: "Collar delicado estilo minimalista para elevar cualquier look.",
  },
  {
    name: "Lavender Room Mist",
    price_cents: 1600,
    stock: 20,
    description: "Spray aromático de lavanda para crear un ambiente tranquilo y acogedor.",
  },
];

for (const product of products) {
  const existing = await request(
    `products?select=id&store_id=eq.${store.id}&name=eq.${encodeURIComponent(product.name)}&limit=1`
  );

  if (existing[0]) {
    await request(`products?id=eq.${existing[0].id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...product,
        store_id: store.id,
        image_url: null,
        active: true,
      }),
    });
  } else {
    await request("products", {
      method: "POST",
      body: JSON.stringify({
        ...product,
        store_id: store.id,
        image_url: null,
        active: true,
      }),
    });
  }
}

console.log(`Demo Boutique ready: /store/${store.slug}`);
