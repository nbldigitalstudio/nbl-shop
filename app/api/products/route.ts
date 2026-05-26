export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { isFounderEmail } from "@/lib/access";
import { getSellerStore } from "@/lib/connect";
import { canAddProduct } from "@/lib/plans";
import type { AccessPlan } from "@/lib/plans";
import { productInputSchema, toProductPayload } from "@/lib/validation";

export async function GET() {
  const { supabase, user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!store) {
    return NextResponse.json({ products: [] });
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!store) {
    return NextResponse.json(
      { error: "Create a store before adding products." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store.id);

  if (countError) {
    return NextResponse.json(
      { error: countError.message },
      { status: 400 }
    );
  }

  // =========================
  // PLAN LOGIC FIX FINAL
  // =========================

  let plan: AccessPlan = "starter";

  if (isFounderEmail(user.email)) {
    plan = "founder";
  } else {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .in("status", ["trialing", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    plan = (subscription?.plan as AccessPlan) ?? "starter";
  }

  const productCount = count ?? 0;

  if (!canAddProduct(plan, productCount)) {
    return NextResponse.json(
      { error: "You reached the 500 product limit" },
      { status: 403 }
    );
  }

  const payload = toProductPayload(
    parsed.data,
    store.id,
    parsed.data.active ?? true
  );

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
