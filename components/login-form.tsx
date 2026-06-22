"use client";

import { useState, useTransition } from "react";
import { Mail, Chrome } from "lucide-react";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const supabase = createSupabaseBrowserClient();

  const redirectURL = () =>
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || window.location.origin;

  // =========================
  // GOOGLE LOGIN
  // =========================
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${redirectURL()}/auth/callback`,
      },
    });

    if (error) setMessage(error.message);
  };

  // =========================
  // FACEBOOK LOGIN
  // =========================
  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${redirectURL()}/auth/callback`,
      },
    });

    if (error) setMessage(error.message);
  };

  // =========================
  // EMAIL LOGIN (OTP)
  // =========================
  const handleEmailLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${redirectURL()}/auth/callback`,
        },
      });

      setMessage(
        error
          ? error.message
          : "Check your email for the sign-in link."
      );
    });
  };

  return (
    <div className="mt-6 grid gap-4">

      {/* EMAIL LOGIN */}
      <form className="grid gap-4" onSubmit={handleEmailLogin}>
        <Field label="Email">
          <Input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </Field>

        <Button type="submit" disabled={isPending}>
          <Mail className="size-4" />
          {isPending ? "Sending..." : "Send sign-in link"}
        </Button>
      </form>

      {/* DIVIDER */}
      <div className="text-center text-sm text-gray-400">
        or continue with
      </div>

      {/* GOOGLE */}
      <Button type="button" onClick={signInWithGoogle}>
        <Chrome className="size-4" />
        Continue with Google
      </Button>

      {/* FACEBOOK */}
      <Button type="button" onClick={signInWithFacebook}>
        Continue with Facebook
      </Button>

      {/* MESSAGE */}
      {message && (
        <p className="text-sm font-medium text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
