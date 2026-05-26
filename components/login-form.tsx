"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const email = String(form.get("email") ?? "");

        startTransition(async () => {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          });

          setMessage(error ? error.message : "Check your email for the sign-in link.");
        });
      }}
    >
      <Field label="Email">
        <Input name="email" type="email" required placeholder="you@example.com" />
      </Field>
      <Button type="submit" disabled={isPending}>
        <Mail className="size-4" />
        {isPending ? "Sending..." : "Send sign-in link"}
      </Button>
      {message ? <p className="text-sm font-semibold text-ink/65">{message}</p> : null}
    </form>
  );
}
