import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5ef] px-4">
      <section className="w-full max-w-md rounded-lg border bg-white p-6 shadow">
        <div className="flex items-center gap-3 text-lg font-black">
          <span className="grid size-9 place-items-center rounded-md bg-black text-white">
            N
          </span>
          NBL Shop
        </div>

        <h1 className="mt-8 text-2xl font-black">
          Sign in to your seller console
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Access your dashboard, products and billing
        </p>

        <LoginForm />
      </section>
    </main>
  );
}
