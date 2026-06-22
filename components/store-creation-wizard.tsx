"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, CreditCard, Store, Truck } from "lucide-react";
import { Button } from "@/components/button";
import { Field, Input, Textarea } from "@/components/field";
import { ImageUpload } from "@/components/image-upload";
import { PLANS } from "@/lib/plans";
import type { BillingInterval, Plan } from "@/lib/types";
import { formatMoney, slugify } from "@/lib/utils";

const steps = ["Negocio", "Propietario", "Plan", "Pagos", "Envíos", "Finalizar"];

type WizardData = {
  name: string;
  slug: string;
  category: string;
  logo_url: string;
  description: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  plan: Plan;
  billing_interval: BillingInterval;
};

export function StoreCreationWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({
    name: "", slug: "", category: "", logo_url: "", description: "",
    owner_name: "", owner_email: "", owner_phone: "", plan: "basic", billing_interval: "month"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ storeId: string; connectUrl: string; stripeAccountCreated: boolean; chargesEnabled: boolean } | null>(null);
  const selectedPlan = PLANS[data.plan];
  const validStep = useMemo(() => {
    if (step === 0) return data.name.trim().length > 1 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) && data.category.trim().length > 1;
    if (step === 1) return data.owner_name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.owner_email);
    return true;
  }, [data, step]);

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  async function createStore() {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/founder/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No se pudo crear la tienda.");
      setResult(payload);
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : "No se pudo crear la tienda.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <section className="rounded-xl border bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-green-700"><Check className="size-7" /></span>
        <h1 className="mt-5 text-2xl font-bold">Tienda creada correctamente</h1>
        <p className="mt-2 text-sm text-gray-500">El usuario fue creado o asignado como owner y la invitación fue procesada.</p>
        <div className="mx-auto mt-6 grid max-w-lg gap-3 rounded-lg bg-gray-50 p-4 text-left text-sm">
          <p className="flex items-center gap-2"><Check className="size-4 text-green-600" /> Stripe Connect configurado</p>
          <p className="flex items-center gap-2"><span className="size-4 rounded-full border-2 border-amber-500" /> Cuenta pendiente de completar onboarding</p>
          <p className="flex items-center gap-2"><Check className="size-4 text-green-600" /> Estructura de envíos preparada</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={result.connectUrl} className="inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white">Completar Stripe</a>
          <Link href={`/dashboard/stores/${result.storeId}`} className="inline-flex h-10 items-center rounded-md bg-gray-900 px-4 text-sm font-semibold text-white">Entrar al dashboard</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="overflow-x-auto rounded-xl border bg-white p-4 shadow-sm">
        <ol className="flex min-w-[680px] items-center justify-between gap-2">
          {steps.map((label, index) => <li key={label} className={`flex items-center gap-2 text-sm font-semibold ${index <= step ? "text-gray-900" : "text-gray-400"}`}><span className={`grid size-7 place-items-center rounded-full ${index < step ? "bg-green-600 text-white" : index === step ? "bg-gray-900 text-white" : "bg-gray-100"}`}>{index < step ? <Check className="size-4" /> : index + 1}</span>{label}</li>)}
        </ol>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        {step === 0 ? <div className="grid gap-5"><div><h1 className="text-xl font-bold">Información del negocio</h1><p className="text-sm text-gray-500">Datos principales de la nueva tienda.</p></div><div className="grid gap-4 md:grid-cols-2"><Field label="Nombre de la tienda"><Input value={data.name} onChange={(event) => { update("name", event.target.value); if (!data.slug) update("slug", slugify(event.target.value)); }} /></Field><Field label="Slug"><Input value={data.slug} onChange={(event) => update("slug", slugify(event.target.value))} /></Field><Field label="Categoría"><Input value={data.category} onChange={(event) => update("category", event.target.value)} placeholder="Moda, belleza, alimentos..." /></Field><div className="md:col-span-2"><ImageUpload name="logo_url" label="Logo" onValueChange={(url) => update("logo_url", url)} /></div><div className="md:col-span-2"><Field label="Descripción"><Textarea value={data.description} onChange={(event) => update("description", event.target.value)} /></Field></div></div></div> : null}

        {step === 1 ? <div className="grid gap-5"><div><h1 className="text-xl font-bold">Propietario</h1><p className="text-sm text-gray-500">Recibirá una invitación para acceder a esta tienda.</p></div><div className="grid gap-4 md:grid-cols-2"><Field label="Nombre"><Input value={data.owner_name} onChange={(event) => update("owner_name", event.target.value)} /></Field><Field label="Email"><Input type="email" value={data.owner_email} onChange={(event) => update("owner_email", event.target.value)} /></Field><Field label="Teléfono (opcional)"><Input type="tel" value={data.owner_phone} onChange={(event) => update("owner_phone", event.target.value)} /></Field></div></div> : null}

        {step === 2 ? <div className="grid gap-5"><div><h1 className="text-xl font-bold">Plan</h1><p className="text-sm text-gray-500">Selecciona el plan y la frecuencia de cobro.</p></div><div className="grid gap-4 md:grid-cols-2">{(["basic", "pro"] as Plan[]).map((planId) => { const plan = PLANS[planId]; return <button type="button" key={planId} onClick={() => update("plan", planId)} className={`rounded-xl border p-5 text-left ${data.plan === planId ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"}`}><h2 className="text-lg font-bold">{plan.name}</h2><p className="mt-1 text-sm text-gray-500">Comisión {plan.feePercent}%</p><p className="mt-4 text-xl font-bold">{formatMoney(plan.monthlyPriceCents)}/mes</p><p className="text-sm font-semibold">{formatMoney(plan.annualPriceCents)}/año</p><p className="mt-1 text-sm font-semibold text-green-600">Ahorra {formatMoney(plan.annualSavingsCents)} al año</p></button>; })}</div><div className="grid max-w-md grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-semibold">{(["month", "year"] as BillingInterval[]).map((interval) => <button type="button" key={interval} onClick={() => update("billing_interval", interval)} className={`rounded-md px-3 py-2 ${data.billing_interval === interval ? "bg-white shadow-sm" : "text-gray-500"}`}>{interval === "month" ? "Mensual" : "Anual"}</button>)}</div></div> : null}

        {step === 3 ? <div className="grid gap-5"><div><h1 className="text-xl font-bold">Pagos</h1><p className="text-sm text-gray-500">La cuenta Express se creará al finalizar. Luego completarás el onboarding seguro de Stripe.</p></div><div className="grid gap-3 rounded-lg bg-gray-50 p-5 text-sm"><p className="flex items-center gap-3"><CreditCard className="size-5 text-blue-600" /> Stripe Connect independiente para esta tienda</p><p className="flex items-center gap-3"><Check className="size-5 text-green-600" /> Cuenta preparada para configuración</p></div></div> : null}

        {step === 4 ? <div className="grid gap-5"><div><h1 className="text-xl font-bold">Envíos</h1><p className="text-sm text-gray-500">Pirate Ship no se conectará todavía.</p></div><div className="rounded-lg border border-dashed p-6"><div className="flex items-start gap-3"><Truck className="mt-0.5 size-5 text-gray-500" /><div><p className="font-semibold">Estructura preparada</p><p className="mt-1 text-sm text-gray-500">Las órdenes podrán guardar etiqueta, tracking, transportista, servicio y fecha de envío.</p></div></div></div></div> : null}

        {step === 5 ? <div className="grid gap-5"><div><h1 className="text-xl font-bold">Finalizar</h1><p className="text-sm text-gray-500">Confirma la información antes de crear la tienda.</p></div><div className="grid gap-3 rounded-lg bg-gray-50 p-5 text-sm"><p><strong>Tienda:</strong> {data.name}</p><p><strong>Propietario:</strong> {data.owner_name} · {data.owner_email}</p><p><strong>Plan:</strong> {selectedPlan.name} · {data.billing_interval === "year" ? `${formatMoney(selectedPlan.annualPriceCents)}/año` : `${formatMoney(selectedPlan.monthlyPriceCents)}/mes`}</p><p><strong>Comisión:</strong> {selectedPlan.feePercent}%</p><p><strong>Stripe:</strong> se creará una cuenta Express</p></div>{error ? <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}</div> : null}

        <div className="mt-8 flex items-center justify-between border-t pt-5">
          <Button type="button" variant="secondary" disabled={step === 0 || isSubmitting} onClick={() => setStep((current) => Math.max(0, current - 1))}><ChevronLeft className="size-4" />Anterior</Button>
          {step < 5 ? <Button type="button" disabled={!validStep} onClick={() => setStep((current) => Math.min(5, current + 1))}>Continuar<ChevronRight className="size-4" /></Button> : <Button type="button" disabled={isSubmitting} onClick={createStore}><Store className="size-4" />{isSubmitting ? "Creando..." : "Crear tienda"}</Button>}
        </div>
      </section>
    </div>
  );
}
