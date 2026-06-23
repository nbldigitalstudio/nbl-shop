"use client";

import { FormEvent, useState } from "react";
import { ChevronDown, Tag } from "lucide-react";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/field";
import type { BillingInterval, Plan } from "@/lib/types";

export function PlanCheckoutForm({ plan, storeId }: { plan: Plan; storeId: string }) {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoValid, setPromoValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  async function validatePromoCode() {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoValid(false);
      setPromoMessage("Escribe un código para aplicarlo.");
      return false;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: code })
      });
      const payload = await response.json();
      const valid = response.ok && payload.valid;
      setPromoValid(valid);
      setPromoMessage(valid ? payload.message : "Este código no es válido o expiró.");
      return valid;
    } catch {
      setPromoValid(false);
      setPromoMessage("No pudimos validar el código. Intenta nuevamente.");
      return false;
    } finally {
      setIsValidating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!promoCode.trim() || promoValid) return;
    event.preventDefault();
    const form = event.currentTarget;
    const valid = await validatePromoCode();
    if (valid) form.submit();
  }

  return (
    <form action="/api/subscriptions" method="GET" className="mt-6 grid gap-3" onSubmit={handleSubmit}>
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="storeId" value={storeId} />
      <div className="grid grid-cols-2 rounded-xl bg-stone-100 p-1 text-sm font-semibold">
        {(["month", "year"] as BillingInterval[]).map((value) => (
          <label key={value} className={`cursor-pointer rounded-lg px-3 py-2 text-center ${interval === value ? "bg-white text-rose-700 shadow-sm" : "text-stone-500"}`}>
            <input className="sr-only" type="radio" name="interval" value={value} checked={interval === value} onChange={() => setInterval(value)} />
            {value === "month" ? "Mensual" : "Anual"}
          </label>
        ))}
      </div>
      <button type="button" className="focus-ring inline-flex h-9 items-center justify-between rounded-md bg-ink/[0.04] px-3 text-sm font-bold" onClick={() => setShowPromoCode((current) => !current)} aria-expanded={showPromoCode}>
        ¿Tienes un código de descuento?
        <ChevronDown className={showPromoCode ? "size-4 rotate-180" : "size-4"} />
      </button>
      {showPromoCode ? <div className="grid gap-2"><Field label="Código promocional"><Input name="promoCode" value={promoCode} onChange={(event) => { setPromoCode(event.target.value.toUpperCase()); setPromoValid(false); setPromoMessage(""); }} placeholder="Ej. 2MONTHPASS" autoComplete="off" /></Field><Button type="button" variant="secondary" onClick={validatePromoCode} disabled={isValidating}>{isValidating ? "Validando..." : "Aplicar código"}</Button>{promoMessage ? <p className={`rounded-xl px-3 py-2 text-sm font-semibold ${promoValid ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{promoMessage}</p> : null}</div> : null}
      <Button type="submit" className="w-full" disabled={isValidating}><Tag className="size-4" />Elegir plan {interval === "year" ? "anual" : "mensual"}</Button>
    </form>
  );
}
