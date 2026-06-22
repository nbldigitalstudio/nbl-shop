export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { isFounderEmail } from "@/lib/access";
import { createSupabaseAdminClient, createSupabaseRouteClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { founderStoreWizardSchema } from "@/lib/validation";
import { defaultStoreTheme } from "@/lib/store-theme";
import { getAppUrl } from "@/lib/url";

export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteClient();
  const { data: authData } = await supabase.auth.getUser();
  const founder = authData.user;

  if (!founder || !isFounderEmail(founder.email)) {
    return NextResponse.json({ error: "Founder access required." }, { status: 403 });
  }

  const parsed = founderStoreWizardSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa la información de la tienda.", details: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;
  const admin = createSupabaseAdminClient();
  const { data: existingStore } = await admin.from("stores").select("id").eq("slug", input.slug).maybeSingle();
  if (existingStore) {
    return NextResponse.json({ error: "Ese slug ya está siendo utilizado." }, { status: 409 });
  }

  const { data: store, error: storeError } = await admin
    .from("stores")
    .insert({
      owner_id: founder.id,
      name: input.name,
      slug: input.slug,
      category: input.category,
      logo_url: input.logo_url || null,
      description: input.description || null,
      owner_name: input.owner_name,
      owner_email: input.owner_email.toLowerCase(),
      owner_phone: input.owner_phone || null,
      plan: input.plan,
      billing_interval: input.billing_interval,
      theme_settings: { ...defaultStoreTheme, logoUrl: input.logo_url || null },
      social_links: {},
      contact_info: input.owner_phone ? { phone: input.owner_phone } : {},
      categories: []
    })
    .select("id, slug")
    .single();

  if (storeError || !store) {
    return NextResponse.json({ error: storeError?.message ?? "No se pudo crear la tienda." }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const appUrl = getAppUrl(request.nextUrl.origin);
    const storefrontUrl = new URL(`/store/${store.slug}`, appUrl);
    const shareUrl = storefrontUrl.protocol === "https:" && !["localhost", "127.0.0.1"].includes(storefrontUrl.hostname);
    const account = await stripe.accounts.create({
      type: "express",
      email: input.owner_email,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_profile: { name: input.name, ...(shareUrl ? { url: storefrontUrl.toString() } : {}) },
      metadata: { store_id: store.id, owner_id: founder.id }
    });

    await admin.from("stores").update({ stripe_account_id: account.id }).eq("id", store.id);

    const { data: invitation, error: invitationError } = await admin.auth.admin.inviteUserByEmail(input.owner_email, {
      data: { full_name: input.owner_name },
      redirectTo: `${appUrl}/auth/callback?next=/dashboard`
    });

    let invitedUserId = invitation.user?.id ?? null;
    if (invitationError) {
      const { data: profile } = await admin.from("profiles").select("id").ilike("email", input.owner_email).maybeSingle();
      invitedUserId = profile?.id ?? null;
    }

    await admin.from("store_invitations").upsert(
      {
        store_id: store.id,
        email: input.owner_email.toLowerCase(),
        role: "owner",
        status: invitedUserId ? "accepted" : "pending",
        invited_by: founder.id,
        accepted_at: invitedUserId ? new Date().toISOString() : null
      },
      { onConflict: "store_id,email" }
    );

    if (invitedUserId) {
      await admin.from("store_members").upsert(
        { store_id: store.id, user_id: invitedUserId, role: "owner" },
        { onConflict: "store_id,user_id" }
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${appUrl}/api/connect/refresh?storeId=${store.id}`,
      return_url: `${appUrl}/api/connect/return?storeId=${store.id}`,
      type: "account_onboarding"
    });

    return NextResponse.json({
      storeId: store.id,
      slug: store.slug,
      connectUrl: accountLink.url,
      stripeAccountCreated: true,
      chargesEnabled: false
    });
  } catch (error) {
    await admin.from("stores").delete().eq("id", store.id);
    console.error("Founder store creation failed:", error);
    return NextResponse.json({ error: "No se pudo completar Stripe Connect. La tienda no fue creada." }, { status: 502 });
  }
}
