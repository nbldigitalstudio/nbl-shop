import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">

      {/* HERO */}
      <section className="px-6 py-24 text-center bg-gradient-to-b from-pink-50 to-white">
        <h1 className="text-5xl font-black">
          NBL SHOP
        </h1>

        <p className="mt-4 text-xl text-gray-600 max-w-xl mx-auto">
          Una madre emprendedora que decidió convertir sus sueños en un negocio digital real.
          Aquí construyes tu tienda, vendes y creces sin límites.
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-black text-white rounded-xl"
          >
            Comenzar ahora
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-3 border border-black rounded-xl"
          >
            Ir al dashboard
          </Link>
        </div>
      </section>

      {/* STORY */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold">Mi historia</h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          NBL SHOP nace de la necesidad de independencia, de una madre que decidió
          no rendirse y crear su propio camino.
          Hoy esta plataforma ayuda a otros emprendedores a vender, crecer y construir su futuro.
        </p>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="font-bold">Crea tu tienda</h3>
            <p className="text-gray-600 mt-2">Personaliza tu marca y vende online.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="font-bold">Recibe pagos</h3>
            <p className="text-gray-600 mt-2">Conecta Stripe y cobra automáticamente.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="font-bold">Control total</h3>
            <p className="text-gray-600 mt-2">Dashboard estilo Shopify en un solo lugar.</p>
          </div>
        </div>
      </section>

    </main>
  );
}