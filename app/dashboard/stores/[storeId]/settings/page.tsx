export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Save, UserPlus, WalletCards } from "lucide-react";
import { inviteStoreMember, upsertStore } from "@/app/actions";
import { Button } from "@/components/button";
import { Field, Input, Textarea } from "@/components/field";
import { ImageUpload } from "@/components/image-upload";
import { StorePreviewCard } from "@/components/store-preview-card";
import { getMyStoreRole, getStoreForUser, getStoreInvitations, getStoreMembers } from "@/lib/data";

export default async function StoreSettingsPage({
  params
}: {
  params: { storeId: string };
}) {
  const store = await getStoreForUser(params.storeId);
  if (!store) notFound();
  const [role, members, invitations] = await Promise.all([
    getMyStoreRole(store.id),
    getStoreMembers(store.id),
    getStoreInvitations(store.id)
  ]);
  const canManage = role === "owner" || role === "admin";

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Store settings</h1>
        <p className="text-sm text-gray-500">{store.name}</p>
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Stripe Connect</h2>
            <p className="text-sm text-gray-500">
              Stripe independiente para esta tienda.
            </p>
          </div>
          {canManage ? <div className="flex gap-2">
            {store.stripe_account_id ? (
              <Link
                href={`/api/connect/dashboard?storeId=${store.id}`}
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold"
              >
                <ExternalLink className="size-4" />
                Stripe dashboard
              </Link>
            ) : null}
            <Link
              href={`/api/connect?storeId=${store.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              <WalletCards className="size-4" />
              {store.stripe_charges_enabled && store.stripe_payouts_enabled
                ? "Update Stripe"
                : "Connect Stripe"}
            </Link>
          </div> : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <form action={upsertStore} className="grid gap-5 rounded-xl bg-white p-6 shadow">
          <input type="hidden" name="store_id" value={store.id} />
          <Field label="Store name">
            <Input name="name" required defaultValue={store.name} />
          </Field>
          <Field label="URL slug">
            <Input name="slug" defaultValue={store.slug} />
          </Field>
          <ImageUpload name="logo_url" label="Logo upload" defaultValue={store.logo_url ?? ""} />
          <ImageUpload name="banner_url" label="Banner upload" defaultValue={store.banner_url ?? ""} />
          <Field label="Theme color">
            <Input name="theme_color" type="color" defaultValue={store.theme_color ?? "#18a986"} className="h-12 p-1" />
          </Field>
          <Field label="Description">
            <Textarea name="description" defaultValue={store.description ?? ""} />
          </Field>
          <Button type="submit" disabled={!canManage} className={!canManage ? "cursor-not-allowed opacity-50" : ""}>
            <Save className="size-4" />
            Save storefront
          </Button>
        </form>
        <StorePreviewCard store={store} />
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div><h2 className="text-lg font-bold">Equipo de la tienda</h2><p className="text-sm text-gray-500">Invita clientes por email. Podrán entrar con magic link o Google y solo verán sus tiendas asignadas.</p></div>
        {canManage ? <form action={inviteStoreMember} className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
          <input type="hidden" name="store_id" value={store.id} />
          <Field label="Email del cliente"><Input name="email" type="email" required placeholder="cliente@email.com" /></Field>
          <Field label="Rol"><select name="role" defaultValue="staff" className="focus-ring h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"><option value="owner">Owner</option><option value="admin">Admin</option><option value="staff">Staff</option></select></Field>
          <Button type="submit"><UserPlus className="size-4" />Invitar</Button>
        </form> : <p className="mt-4 text-sm text-gray-500">Tu rol permite ver esta tienda, pero no administrar miembros.</p>}
        <div className="mt-5 divide-y rounded-lg border">
          {members.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><div><p className="font-semibold">{member.profiles?.full_name || member.profiles?.email || "Usuario"}</p><p className="text-gray-500">{member.profiles?.email}</p></div><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize">{member.role}</span></div>)}
          {invitations.map((invitation) => <div key={invitation.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><div><p className="font-semibold">{invitation.email}</p><p className="text-amber-600">Invitación pendiente</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-700">{invitation.role}</span></div>)}
          {!members.length && !invitations.length ? <p className="px-4 py-5 text-sm text-gray-500">Aún no hay miembros.</p> : null}
        </div>
      </section>
    </div>
  );
}
