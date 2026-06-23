export const dynamic = "force-dynamic";

import { CreditCard, Crown, ExternalLink, Gift, WalletCards } from "lucide-react";
import { createGraceCode, redeemGraceCode } from "@/app/actions";
import { LinkButton, Button } from "@/components/button";
import { Field, Input } from "@/components/field";
import { isFounderEmail } from "@/lib/access";
import { getActiveGraceCodes, getCurrentUser, getMyStore } from "@/lib/data";
import { plans } from "@/lib/plans";
import { formatMoney } from "@/lib/utils";
import { PlanCheckoutForm } from "@/components/plan-checkout-form";

export default async function BillingPage({ searchParams }: { searchParams?: { error?: string; subscription?: string } }) {
  const user = await getCurrentUser();
  const store = await getMyStore();
  const isFounder = isFounderEmail(user?.email);
  const graceCodes = isFounder ? await getActiveGraceCodes() : [];
  const connectReady = !!store?.stripe_charges_enabled && !!store?.stripe_payouts_enabled;

  return (
    <div className="grid gap-6">
      <div><p className="text-sm font-black uppercase tracking-[.16em] text-rose-500">Tu crecimiento, a tu ritmo</p><h1 className="mt-1 text-3xl font-black">Planes y pagos</h1><p className="mt-2 text-stone-500">Paga solo tu plan mensual o anual. No cobramos comisión por tus ventas; Stripe solo aplica su tarifa estándar de procesamiento.</p></div>
      {searchParams?.error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{searchParams.error}</div> : null}
      {searchParams?.subscription === "success" ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">Tu suscripción fue activada correctamente. ¡Gracias por crecer con NBL Shop!</div> : null}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="text-xl font-bold">Stripe Connect</h2><p className="text-sm text-gray-500">Los pagos de la tienda llegan directamente a su cuenta.</p></div>
          <div className="flex gap-2">
            {store?.stripe_account_id ? <LinkButton href={`/api/connect/dashboard?storeId=${store.id}`} variant="secondary"><ExternalLink className="size-4" />Stripe dashboard</LinkButton> : null}
            <LinkButton href={store ? `/api/connect?storeId=${store.id}` : "/dashboard/stores"}><WalletCards className="size-4" />{connectReady ? "Actualizar Stripe" : "Conectar Stripe"}</LinkButton>
          </div>
        </div>
        <div className={`mt-4 rounded-xl p-4 text-sm font-medium ${connectReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {connectReady ? "La tienda puede aceptar pagos y recibir depósitos." : "Completa Stripe onboarding para recibir pagos."}
        </div>
      </section>

      {isFounder ? (
        <>
          <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4"><div className="grid size-10 place-items-center rounded-md bg-yellow-100 text-yellow-600"><Crown className="size-5" /></div><div><h2 className="text-xl font-bold">Acceso founder</h2><p className="mt-1 text-sm text-gray-500">Acceso administrativo completo. El estado de billing nunca bloquea tiendas ni clientes.</p></div></div>
          </section>
          <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3"><Gift className="size-5 text-blue-600" /><div><h2 className="font-bold">Generar código de gracia</h2><p className="text-sm text-gray-500">Crea un código para extender 15 días el plazo de un cliente.</p></div></div>
            <form action={createGraceCode} className="mt-4 flex max-w-sm items-end gap-3"><Field label="Días"><Input name="days" type="number" min="1" max="90" defaultValue="15" /></Field><Button type="submit">Generar código</Button></form>
            {graceCodes.length ? <div className="mt-5 divide-y rounded-lg border">{graceCodes.map((code) => <div key={code.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div><p className="font-mono font-bold">{code.code}</p><p className="text-xs text-gray-500">{code.grace_days} días · {code.redemption_count} usos</p></div><span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Activo</span></div>)}</div> : null}
          </section>
        </>
      ) : store ? (
        <>
          {["past_due", "unpaid", "incomplete"].includes(store.billing_status) ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">Tu pago está pendiente. Tu tienda sigue activa. Por favor actualiza tu método de pago.</div> : null}
          <section><h2 className="text-2xl font-black">Elige el plan que te acompaña</h2><p className="mt-1 text-sm text-stone-500">Mensual o anual, siempre con tu tienda activa y acceso completo a tu trabajo.</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {plans.map((plan) => <div key={plan.id} className={`rounded-[1.75rem] border bg-white p-6 shadow-sm ${store.plan === plan.id ? "border-rose-300 ring-4 ring-rose-100" : "border-stone-100"}`}>
                <div className="flex items-start justify-between"><div><h3 className="text-xl font-black">{plan.name}</h3><p className="text-sm font-semibold text-emerald-700">{plan.salesFeeLabel}</p><p className="mt-1 text-xs text-stone-500">Tú conservas tus ingresos; Stripe solo cobra su procesamiento estándar.</p></div><span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-500"><CreditCard className="size-5" /></span></div>
                <div className="mt-5 grid grid-cols-2 gap-3"><div><p className="text-xs font-semibold uppercase text-gray-500">Mensual</p><p className="text-2xl font-bold">{formatMoney(plan.monthlyPriceCents)}<span className="text-sm text-gray-500">/mes</span></p></div><div><p className="text-xs font-semibold uppercase text-gray-500">Anual</p><p className="text-2xl font-bold">{formatMoney(plan.annualPriceCents)}<span className="text-sm text-gray-500">/año</span></p><p className="text-xs font-semibold text-green-600">Ahorra {formatMoney(plan.annualSavingsCents)} al año</p></div></div>
                <ul className="mt-5 grid gap-2 text-sm">{plan.features.map((feature) => <li key={feature}>✔ {feature}</li>)}</ul>
                <PlanCheckoutForm plan={plan.id} storeId={store.id} />
              </div>)}
            </div>
          </section>
          <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5 shadow-sm"><h2 className="font-bold">¿Necesitas un poco más de tiempo?</h2><p className="mt-1 text-sm text-stone-500">Si recibiste un código de gracia, aplícalo aquí. Tu tienda permanece activa con o sin código.</p><form action={redeemGraceCode} className="mt-4 flex max-w-md items-end gap-3"><input type="hidden" name="store_id" value={store.id} /><Field label="Código"><Input name="code" required placeholder="GRACE-XXXXXXXX" /></Field><Button type="submit">Aplicar</Button></form></section>
        </>
      ) : null}
    </div>
  );
}
