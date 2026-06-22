"use client";

import { useState } from "react";
import { ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/field";
import type { BillingInterval, Plan } from "@/lib/types";

export function PlanCheckoutForm({ plan, storeId }: { plan: Plan; storeId: string }) {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [showPromoCode, setShowPromoCode] = useState(false);

  return (
    <form action="/api/subscriptions" method="GET" className="mt-6 grid gap-3">
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="storeId" value={storeId} />
      <div className="grid grid-cols-2 rounded-md bg-gray-100 p-1 text-sm font-semibold">
        {(["month", "year"] as BillingInterval[]).map((value) => (
          <label key={value} className={`cursor-pointer rounded px-3 py-2 text-center ${interval === value ? "bg-white shadow-sm" : "text-gray-500"}`}>
            <input className="sr-only" type="radio" name="interval" value={value} checked={interval === value} onChange={() => setInterval(value)} />
            {value === "month" ? "Mensual" : "Anual"}
          </label>
        ))}
      </div>
      <button type="button" className="focus-ring inline-flex h-9 items-center justify-between rounded-md bg-ink/[0.04] px-3 text-sm font-bold" onClick={() => setShowPromoCode((current) => !current)} aria-expanded={showPromoCode}>
        ¿Tienes un código de descuento?
        <ChevronDown className={showPromoCode ? "size-4 rotate-180" : "size-4"} />
      </button>
      {showPromoCode ? <Field label="Código promocional"><Input name="promoCode" placeholder="Ingresa el código" autoComplete="off" /></Field> : null}
      <Button type="submit" className="w-full"><Tag className="size-4" />Elegir plan {interval === "year" ? "anual" : "mensual"}</Button>
    </form>
  );
}
