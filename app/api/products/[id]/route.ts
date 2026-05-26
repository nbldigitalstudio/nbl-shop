export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSellerStore } from "@/lib/connect";
import { productInputSchema, toProductPayload } from "@/lib/validation";

type SellerStore = {
  supabase: any;
  user: any;
  store: { id: string } | null;
};

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const parsedParams = paramsSchema.safeParse(params);

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: "Invalid product id." },
      { status: 400 }
    );
  }

  const { supabase, user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!store) {
    return NextResponse.json(
      { error: "Create a store before editing products." },
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

  const payload = toProductPayload(
    parsed.data,
    store.id,
    parsed.data.active ?? true
  );

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", parsedParams.data.id)
    .eq("store_id", store.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const parsedParams = paramsSchema.safeParse(params);

  if (!parsedParams.success) {
    return NextResponse.json(
      { error: "Invalid product id." },
      { status: 400 }
    );
  }

  const { supabase, user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!store) {
    return NextResponse.json(
      { error: "Create a store before deleting products." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", parsedParams.data.id)
    .eq("store_id", store.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ deleted: true });
}
