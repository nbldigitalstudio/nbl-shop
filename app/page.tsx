import { LinkButton } from "@/components/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-ink">
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="text-4xl font-black leading-tight md:text-6xl">
          Una madre emprendedora construyendo su futuro con cada venta 💛
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink/70">
          NBL Shop nació de la necesidad de salir adelante, de crear algo propio
          y demostrar que desde casa también se puede construir un negocio real,
          rentable y con propósito.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <LinkButton href="/dashboard" className="h-12 px-6 text-base">
            Empezar ahora
          </LinkButton>

          <LinkButton href="#historia" variant="secondary" className="h-12 px-6 text-base">
            Conocer mi historia
          </LinkButton>
        </div>
      </section>

      <section id="historia" className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-black">Mi historia</h2>

        <p className="mt-4 leading-8 text-ink/70">
          Empecé como muchas: con sueños grandes y recursos limitados. Como
          madre, siempre quise algo mejor para mi familia. NBL Shop no nació
          perfecto, nació de intentos, errores y mucha determinación.
        </p>

        <p className="mt-4 leading-8 text-ink/70">
          Hoy ayudo a otras personas a crear sus tiendas, vender online y
          transformar sus ideas en ingresos reales desde casa.
        </p>
      </section>

      <section className="border-y border-ink/10 bg-white py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 text-center md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold">💻 Tiendas online</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              Crea tu ecommerce profesional sin complicaciones.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold">📦 Ventas reales</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              Herramientas para vender productos desde casa.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold">🚀 Emprende</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              Empieza aunque no tengas experiencia previa.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl font-black">
          Tu historia también puede empezar hoy
        </h2>

        <p className="mt-4 text-ink/70">
          No necesitas tenerlo todo listo, solo empezar.
        </p>

        <LinkButton href="/dashboard" className="mt-8 h-12 px-8 text-base">
          Crear mi tienda
        </LinkButton>
      </section>
    </main>
  );
}
