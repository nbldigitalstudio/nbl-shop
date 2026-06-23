import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#fff8f4] px-4 py-12">
      <div className="absolute -left-28 top-12 size-80 rounded-full bg-rose-200/50 blur-3xl" /><div className="absolute -right-24 bottom-0 size-96 rounded-full bg-violet-200/45 blur-3xl" />
      <section className="relative w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_28px_80px_rgba(91,65,77,.14)] backdrop-blur sm:p-9">
        <Link href="/" className="flex items-center gap-3 text-lg font-black">
          <span className="grid size-10 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
            N
          </span>
          NBL Shop
        </Link>

        <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"><Heart className="size-3.5 fill-rose-200" />Qué bueno tenerte aquí</p>
        <h1 className="mt-4 text-3xl font-black leading-tight">
          Entra a cuidar y hacer crecer tu negocio
        </h1>

        <p className="mt-3 text-sm leading-6 text-stone-500">
          Accede a tus tiendas, productos y pedidos. Todo está aquí, organizado para ti.
        </p>

        <LoginForm />
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-stone-400"><Sparkles className="size-3.5 text-violet-400" />No tienes que hacerlo todo sola.</p>
      </section>
    </main>
  );
}
