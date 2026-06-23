import Link from "next/link";
import { ArrowRight, Check, CreditCard, Heart, Package, ShieldCheck, Sparkles, Store } from "lucide-react";
import { plans } from "@/lib/plans";
import { formatMoney } from "@/lib/utils";

const benefits = [
  { icon: Store, title: "Tu tienda, lista contigo", text: "Te ayudamos a comenzar con una tienda clara, bonita y preparada para vender." },
  { icon: CreditCard, title: "Pagos sin enredos", text: "Cada negocio conecta su propia cuenta de Stripe y recibe sus pagos directamente." },
  { icon: Package, title: "Todo en un solo lugar", text: "Productos, pedidos, inventario y crecimiento desde un dashboard fácil de entender." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf7] text-ink">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-black"><span className="grid size-10 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">N</span>NBL Shop</Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-stone-600 md:flex"><a href="#historia">Nuestra historia</a><a href="#planes">Planes</a><Link href="/help">Ayuda</Link><Link href="/login">Iniciar sesión</Link></nav>
        <Link href="/login" className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5">Comienza tu tienda</Link>
      </header>

      <section className="relative px-5 pb-24 pt-16 sm:px-8 lg:pt-24">
        <div className="absolute -left-28 top-12 size-80 rounded-full bg-rose-200/40 blur-3xl" /><div className="absolute -right-24 top-32 size-96 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm font-bold text-rose-700 shadow-sm"><Heart className="size-4 fill-rose-200" />Creada con amor para personas que están comenzando</p>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Tu negocio merece un hogar <span className="text-rose-500">bonito y fácil</span> en internet.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">Nosotros te ayudamos a tener tu tienda lista para vender, sin complicaciones. Tú traes tu sueño; NBL Shop te acompaña a convertirlo en algo real.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-rose-200 transition hover:-translate-y-0.5">Comienza tu tienda<ArrowRight className="size-4" /></Link><Link href="/store/demo-boutique" className="rounded-full border border-rose-200 bg-white px-6 py-3.5 font-bold text-rose-600 shadow-sm">Ver tienda demo</Link><Link href="/dashboard/stores/new" className="rounded-full border border-stone-200 bg-white px-6 py-3.5 font-bold shadow-sm">Solicita que creemos tu tienda</Link><Link href="/help" className="rounded-full px-5 py-3.5 font-bold text-violet-700">Ver guía rápida</Link></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-stone-500"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" />Tu tienda siempre activa</span><span className="flex items-center gap-2"><Sparkles className="size-4 text-violet-500" />Acompañamiento humano</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rotate-3 rounded-[2.5rem] bg-gradient-to-br from-rose-200 via-amber-100 to-violet-200" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(91,65,77,.16)] backdrop-blur">
              <div className="flex items-center justify-between"><div><p className="text-sm font-bold text-stone-400">Tu negocio está creciendo</p><p className="mt-1 text-2xl font-black">Buenos días, emprendedora ✨</p></div><span className="grid size-12 place-items-center rounded-2xl bg-mint/10 text-mint"><Store className="size-6" /></span></div>
              <div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-rose-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-rose-500">Ventas del mes</p><p className="mt-2 text-2xl font-black">$2,480</p><p className="mt-1 text-xs font-semibold text-emerald-700">Tu esfuerzo está dando frutos</p></div><div className="rounded-2xl bg-violet-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-violet-500">Pedidos</p><p className="mt-2 text-2xl font-black">38</p><p className="mt-1 text-xs font-semibold text-stone-500">Listos para preparar</p></div></div>
              <div className="mt-4 rounded-2xl border border-stone-100 p-4"><p className="font-bold">Tu próximo paso</p><p className="mt-1 text-sm leading-6 text-stone-500">Añade tus productos y comparte tu tienda. No tienes que saberlo todo para comenzar.</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-rose-400 to-violet-400" /></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/70 px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-rose-500">Hecho para personas reales</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Vender online puede sentirse más simple</h2><p className="mt-4 leading-7 text-stone-600">No necesitas sentirte sola ni perdida. Organizamos la tecnología para que puedas concentrarte en tu negocio.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{benefits.map((benefit) => <article key={benefit.title} className="rounded-[1.75rem] border border-stone-100 bg-white p-7 shadow-[0_18px_50px_rgba(91,65,77,.08)]"><span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-100 to-violet-100 text-rose-600"><benefit.icon className="size-5" /></span><h3 className="mt-5 text-xl font-black">{benefit.title}</h3><p className="mt-2 leading-7 text-stone-600">{benefit.text}</p></article>)}</div></div></section>

      <section id="historia" className="px-5 py-24 sm:px-8"><div className="mx-auto grid max-w-6xl gap-12 rounded-[2.5rem] bg-[#4b3542] p-8 text-white sm:p-12 lg:grid-cols-[.8fr_1.2fr] lg:p-16"><div><p className="text-sm font-black uppercase tracking-[.2em] text-rose-200">La historia detrás de NBL</p><h2 className="mt-4 text-4xl font-black leading-tight">Una plataforma nacida del esfuerzo, la fe y mucho amor.</h2></div><div className="space-y-5 text-lg leading-8 text-rose-50/85"><p>NBL Shop nació de una madre luchadora que decidió crear una herramienta para ayudar a otros emprendedores a vender online de una forma más simple, cálida y accesible.</p><p>No es solo tecnología. Es compañía para pequeños negocios, madres emprendedoras y personas que están comenzando desde cero, con sueños grandes y recursos reales.</p><p className="font-bold text-white">Aquí creemos que comenzar con ayuda también es una forma de ser valiente.</p></div></div></section>

      <section id="planes" className="bg-[#f5efff] px-5 py-24 sm:px-8"><div className="mx-auto max-w-6xl"><div className="text-center"><p className="text-sm font-black uppercase tracking-[.2em] text-violet-600">Planes claros, sin sorpresas</p><h2 className="mt-3 text-4xl font-black">Elige el plan que acompaña tu momento</h2><p className="mt-4 text-stone-600">Paga solo tu plan mensual o anual. No cobramos comisión por tus ventas.</p></div><div className="mt-12 grid gap-6 lg:grid-cols-2">{plans.map((plan, index) => <article key={plan.id} className={`relative rounded-[2rem] border bg-white p-8 shadow-soft ${index === 1 ? "border-violet-300" : "border-rose-200"}`}>{index === 1 ? <span className="absolute right-6 top-6 rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">Para crecer en grande</span> : null}<h3 className="text-2xl font-black">{plan.name}</h3><p className="mt-2 font-semibold text-emerald-700">{plan.salesFeeLabel}</p><p className="mt-1 text-sm text-stone-500">Tú conservas tus ingresos; Stripe solo aplica su tarifa estándar de procesamiento.</p><div className="mt-7 flex flex-wrap items-end gap-5"><p className="text-4xl font-black">{formatMoney(plan.monthlyPriceCents)}<span className="text-base font-semibold text-stone-400">/mes</span></p><div><p className="font-bold">{formatMoney(plan.annualPriceCents)}/año</p><p className="text-sm font-bold text-emerald-700">Ahorra {formatMoney(plan.annualSavingsCents)} al año</p></div></div><ul className="mt-7 grid gap-3 text-sm">{plan.features.map((feature) => <li key={feature} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="size-3.5" /></span>{feature}</li>)}</ul><Link href="/login" className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 font-bold ${index === 1 ? "bg-violet-600 text-white" : "bg-rose-500 text-white"}`}>Comienza con {plan.name}</Link></article>)}</div></div></section>

      <section className="px-5 py-24 text-center sm:px-8"><div className="mx-auto max-w-3xl"><Heart className="mx-auto size-10 fill-rose-100 text-rose-500" /><h2 className="mt-5 text-4xl font-black">Tu sueño no tiene que empezar perfecto. Solo tiene que empezar.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">Nosotros te ayudamos a preparar el camino para que puedas vender, crecer y sentirte acompañada.</p><Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-bold text-white">Comienza tu tienda<ArrowRight className="size-4" /></Link></div></section>
      <footer className="border-t border-stone-200 px-5 py-8 text-center text-sm text-stone-500">NBL Shop · Creada con amor para pequeños negocios y grandes sueños.</footer>
    </main>
  );
}
