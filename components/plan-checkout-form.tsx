"use client";

import { useState } from "react";
import { ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/field";
import type { Plan } from "@/lib/types";

export function PlanCheckoutForm({ plan }: { plan: Plan }) {
  const [showPromoCode, setShowPromoCode] = useState(false);

  return (
    <form action="/api/subscriptions" method="GET" className="mt-6 grid gap-3">
      <input type="hidden" name="plan" value={plan} />
      <button
        type="button"
        className="focus-ring inline-flex h-9 items-center justify-between rounded-md bg-ink/[0.04] px-3 text-sm font-bold text-ink transition hover:bg-ink/[0.07]"
        onClick={() => setShowPromoCode((current) => !current)}
        aria-expanded={showPromoCode}
      >
        Have a promo code?
        <ChevronDown className={showPromoCode ? "size-4 rotate-180 transition" : "size-4 transition"} />
      </button>
      {showPromoCode ? (
        <Field label="Stripe promo code">
          <Input name="promoCode" placeholder="Enter code" autoComplete="off" />
        </Field>
      ) : null}
      <Button type="submit" className="w-full">
        <Tag className="size-4" />
        Choose plan
      </Button>
    </form>
  );
}
