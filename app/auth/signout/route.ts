export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = createSupabaseRouteClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(requestUrl.origin, 303);
}
