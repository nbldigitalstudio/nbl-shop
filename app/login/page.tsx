import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-4">
      <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 text-lg font-black">
          <span className="grid size-9 place-items-center rounded-md bg-ink text-white">N</span>
          NBL Shop
        </div>
        <h1 className="mt-8 text-2xl font-black">Sign in to your seller console</h1>
        <p className="mt-2 text-sm leading-6 text-ink/60">Use your email to access your stores, products, orders, and billing.</p>
        <LoginForm />
      </section>
    </main>
  );
}
