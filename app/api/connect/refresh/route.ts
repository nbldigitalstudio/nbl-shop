export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/url";

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request.nextUrl.origin);
  const storeId = request.nextUrl.searchParams.get("storeId");
  const suffix = storeId ? `?storeId=${storeId}` : "";

  return NextResponse.redirect(`${appUrl}/api/connect${suffix}`);
}
