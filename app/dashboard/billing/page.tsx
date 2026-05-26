export const dynamic = "force-dynamic";

import { Check, CreditCard, Crown, ExternalLink, WalletCards } from "lucide-react";
import { LinkButton } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PlanCheckoutForm } from "@/components/plan-checkout-form";
import { isFounderEmail } from "@/lib/access";
import { getCurrentUser, getMyStore } from "@/lib/data";
import { plans } from "@/lib/plans";

export default async function BillingPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const [store, user] = await Promise.all([getMyStore(), getCurrentUser()]);

  if (!store) {
    return <EmptyState title="Create your store first" text="Billing and Connect onboarding attach to your store tenant." href="/dashboard/settings" action="Create store" />;
  }

  const isFounder = isFounderEmail(user?.email);
  const connectReady = store.stripe_charges_enabled && store.stripe_payouts_enabled;
  const connectStatus = [
    { label: "Details submitted", ready: store.stripe_details_submitted },
    { label: "Charges enabled", ready: store.stripe_charges_enabled },
    { label: "Payouts enabled", ready: store.stripe_payouts_enabled }
  ];

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Stripe Connect</h2>
            <p className="mt-1 text-sm text-ink/60">Route customer payments directly to your seller bank account.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {store.stripe_account_id ? (
              <LinkButton href="/api/connect/dashboard" variant="secondary">
                <ExternalLink className="size-4" />
                Stripe dashboard
              </LinkButton>
            ) : null}
            <LinkButton href="/api/connect">
              <WalletCards className="size-4" />
              {connectReady ? "Update Stripe" : "Connect Stripe"}
            </LinkButton>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {connectStatus.map((item) => (
            <div key={item.label} className="rounded-md bg-ink/[0.03] p-4">
              <p className="text-sm font-semibold text-ink/60">{item.label}</p>
              <p className={item.ready ? "mt-2 font-black text-mint" : "mt-2 font-black text-coral"}>
                {item.ready ? "Ready" : "Required"}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-ink/[0.03] p-4 text-sm font-semibold">
          {connectReady
            ? "Your store can accept payments and receive seller payouts."
            : "Complete Stripe onboarding before customers can check out."}
        </div>
      </section>
      {isFounder ? (
        <section className="rounded-lg border border-mint/30 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-md bg-mint/10 text-mint">
              <Crown className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Founder access</h2>
              <p className="mt-1 text-sm leading-6 text-ink/65">
                Unlimited features are enabled for this account. No subscription or billing checkout is required.
              </p>
            </div>
          </div>
        </section>
      ) : null}
      {!isFounder ? (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Subscription plans</h2>
            {searchParams?.error ? (
              <p className="rounded-md bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{searchParams.error}</p>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">{plan.name}</h3>
                    <p className="text-sm text-ink/60">{plan.trial}</p>
                  </div>
                  <CreditCard className="size-5 text-mint" />
                </div>
                <p className="mt-5 text-3xl font-black">{plan.price}<span className="text-sm font-semibold text-ink/55">/mo</span></p>
                <ul className="mt-5 grid gap-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="size-4 text-mint" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <PlanCheckoutForm plan={plan.id} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
