import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-rose-500 text-white shadow-sm shadow-rose-200 hover:bg-rose-600",
  secondary: "bg-white text-ink ring-1 ring-stone-200 hover:bg-rose-50",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  danger: "bg-coral text-white hover:bg-coral/90"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
        variants[variant ?? "primary"],
        className
      )}
    >
      {children}
    </Link>
  );
}
