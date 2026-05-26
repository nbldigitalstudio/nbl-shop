import { ArrowRight, CreditCard, Palette, Store, WalletCards } from "lucide-react";
import { LinkButton } from "@/components/button";
import { plans } from "@/lib/plans";

export default function HomePage() {
  const platformFeatures = [
    { title: "Store builder", text: "Branding, logo, banner, color, and unique /store/{slug} URL.", icon: Palette },
    { title: "Stripe Connect", text: "Sellers onboard once and receive funds directly.", icon: WalletCards },
    { title: "Checkout", text: "Hosted Stripe Checkout with Apple Pay and cards.", icon: CreditCard },
    { title: "Multi-tenant", text: "Data scoped per store with PostgreSQL row-level security.", icon: Store }
  ];

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid min-h-[86vh] max-w-7xl content-between px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-lg font-black">
              <span className="grid size-9 place-items-center rounded-md bg-ink text-white">N</span>
              NBL Shop
            </div>
            <LinkButton href="/dashboard" variant="secondary">
              Dashboard
            </LinkButton>
          </nav>
          <div className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-mint">Multi-tenant ecommerce SaaS</p>
              <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.02] sm:text-7xl">
                NBL Shop
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/70">
                Launch hosted storefronts, manage products and orders, accept Apple Pay and cards, and route seller payouts through Stripe Connect.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/dashboard">
                  Start building
                  <ArrowRight className="size-4" />
                </LinkButton>
                <LinkButton href="/dashboard/billing" variant="secondary">
                  View plans
                </LinkButton>
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-ink/10 bg-[#f7f5ef] p-4 shadow-soft">
              {platformFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4 rounded-md bg-white p-4 ring-1 ring-ink/5">
                  <feature.icon className="mt-1 size-5 text-mint" />
                  <div>
                    <h2 className="font-bold">{feature.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink/65">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 pb-2 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-md border border-ink/10 bg-[#f7f5ef] p-4">
                <div className="flex items-end justify-between gap-3">
                  <h2 className="font-black">{plan.name}</h2>
                  <p className="text-xl font-black">{plan.price}</p>
                </div>
                <p className="mt-1 text-sm text-ink/60">{plan.trial}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
