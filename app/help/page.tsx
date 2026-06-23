import Link from "next/link";
import { ArrowRight, CreditCard, HelpCircle, Package, ReceiptText, Rocket, Ship, ShoppingBag, Sparkles } from "lucide-react";

const guides = [
  {
    id: "inicio",
    title: "Guía rápida para comenzar",
    icon: Rocket,
    intro: "Los pasos esenciales para dejar una tienda lista para vender.",
    steps: [
      "Entra al dashboard con magic link o Google.",
      "Revisa que tu tienda tenga nombre, logo, descripción y colores básicos.",
      "Agrega tus primeros productos con precio, imagen, descripción e inventario.",
      "Conecta Stripe para poder recibir pagos.",
      "Haz una compra de prueba antes de compartir tu tienda."
    ]
  },
  {
    id: "productos",
    title: "Cómo agregar productos",
    icon: Package,
    intro: "Los productos son el corazón de cada tienda.",
    steps: [
      "Ve a Productos desde el dashboard.",
      "Crea un producto con nombre claro, precio, imagen y stock.",
      "Activa el producto para que aparezca en la tienda pública.",
      "Si un producto se agota o todavía no está listo, puedes desactivarlo sin borrarlo.",
      "Mantén el inventario actualizado para evitar ventas que no puedas preparar."
    ]
  },
  {
    id: "stripe",
    title: "Cómo conectar Stripe",
    icon: CreditCard,
    intro: "Stripe Connect permite que cada tienda cobre y reciba sus propios pagos.",
    steps: [
      "Ve a Planes y pagos o Configuración de la tienda.",
      "Presiona Conectar Stripe.",
      "Completa el onboarding seguro de Stripe.",
      "Regresa al dashboard y confirma que Stripe esté listo para cobrar.",
      "Si Stripe pide más información, entra al dashboard de Stripe y completa lo pendiente."
    ]
  },
  {
    id: "ordenes",
    title: "Cómo procesar órdenes",
    icon: ReceiptText,
    intro: "Cada compra pagada aparece automáticamente en Pedidos.",
    steps: [
      "Ve a Pedidos para ver ventas recientes.",
      "Abre una orden para revisar productos, total, dirección y estado de pago.",
      "Prepara los artículos del pedido.",
      "Si necesitas etiqueta, exporta el CSV para Pirate Ship.",
      "Cuando tengas tracking, pégalo en la orden y márcala como enviada."
    ]
  },
  {
    id: "shipping",
    title: "Cómo usar Pirate Ship por CSV",
    icon: Ship,
    intro: "NBL Shop no usa API privada de Pirate Ship. El flujo oficial preparado es por CSV.",
    steps: [
      "Abre el detalle de la orden.",
      "Presiona Exportar CSV.",
      "Entra a Pirate Ship y sube el archivo CSV.",
      "Compra la etiqueta desde Pirate Ship.",
      "Copia el tracking y pégalo en NBL Shop.",
      "Marca la orden como enviada."
    ]
  },
  {
    id: "billing",
    title: "Planes y pagos",
    icon: ShoppingBag,
    intro: "NBL Shop no cobra comisión por venta. Stripe solo aplica su tarifa estándar de procesamiento.",
    steps: [
      "Elige Basic o Pro según la etapa del negocio.",
      "Puedes pagar mensual o anual.",
      "Si un pago queda pendiente, la tienda sigue activa.",
      "Actualiza el método de pago desde Planes y pagos cuando sea necesario.",
      "Los productos, órdenes y checkout siguen funcionando aunque haya un pago pendiente."
    ]
  }
];

const faqs = [
  {
    question: "¿Mi tienda se desactiva si el pago del plan está pendiente?",
    answer: "No. Tu tienda pública, tu dashboard y tu checkout siguen activos. Solo verás un aviso amable para actualizar el método de pago."
  },
  {
    question: "¿NBL Shop cobra comisión por venta?",
    answer: "No. Pagas tu plan mensual o anual. Stripe cobra únicamente su tarifa estándar de procesamiento."
  },
  {
    question: "¿Pirate Ship está conectado por API?",
    answer: "No. Pirate Ship no ofrece API pública, por eso NBL Shop usa exportación CSV compatible y tracking manual."
  },
  {
    question: "¿Cada tienda tiene su propio Stripe?",
    answer: "Sí. Cada tienda usa su propia cuenta Stripe Connect Express para recibir pagos."
  }
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7] text-ink">
      <section className="border-b border-rose-100 bg-white/80 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-black">
            <span className="grid size-10 place-items-center rounded-2xl bg-rose-400 text-white">N</span>
            NBL SHOP
          </Link>
          <div className="flex gap-2">
            <Link href="/login" className="rounded-full bg-stone-100 px-4 py-2 text-sm font-bold">Entrar</Link>
            <Link href="/dashboard" className="rounded-full bg-rose-500 px-4 py-2 text-sm font-bold text-white">Dashboard</Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-black uppercase tracking-[.16em] text-rose-600">
              <HelpCircle className="size-4" /> Centro de ayuda
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
              Guía rápida para vender con más calma.
            </h1>
            <p className="mt-5 text-lg leading-8 text-stone-600">
              Aquí tienes los pasos principales para manejar productos, conectar Stripe, procesar órdenes y preparar envíos con Pirate Ship por CSV.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <a key={guide.id} href={`#${guide.id}`} className="rounded-3xl border border-stone-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-rose-100 to-violet-100 text-rose-600">
                  <guide.icon className="size-5" />
                </span>
                <h2 className="mt-4 text-lg font-black">{guide.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">{guide.intro}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          {guides.map((guide) => (
            <article key={guide.id} id={guide.id} className="scroll-mt-8 rounded-[2rem] border border-stone-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                  <guide.icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-black">{guide.title}</h2>
                  <p className="mt-2 text-stone-500">{guide.intro}</p>
                </div>
              </div>
              <ol className="mt-6 grid gap-3">
                {guide.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 rounded-2xl bg-[#fffaf7] p-4 text-sm leading-6 text-stone-700">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-rose-500 text-xs font-black text-white">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f5efff] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 text-violet-600" />
            <h2 className="text-3xl font-black">Preguntas frecuentes</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="font-black">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 text-center sm:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-rose-100 bg-white p-8 shadow-soft">
          <h2 className="text-3xl font-black">¿Lista para seguir?</h2>
          <p className="mt-3 text-stone-600">Vuelve al dashboard y continúa preparando tu tienda con confianza.</p>
          <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-bold text-white">
            Ir al dashboard <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
