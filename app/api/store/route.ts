export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getSellerStore } from "@/lib/connect";
import { storeInputSchema, toStorePayload } from "@/lib/validation";

export async function GET() {
  const { user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ store });
}

export async function PUT(request: NextRequest) {
  const { supabase, user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = storeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = toStorePayload(parsed.data, user.id);

  if (store) {
    const { data, error } = await supabase
      .from("stores")
      .update(payload)
      .eq("id", store.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ store: data });
  }

  const { data, error } = await supabase.from("stores").insert(payload).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ store: data }, { status: 201 });
}
