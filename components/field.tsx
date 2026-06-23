import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/utils";

export function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "focus-ring h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm shadow-sm",
        props.className
      )}
      {...props}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "focus-ring min-h-28 rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm shadow-sm",
        props.className
      )}
      {...props}
    />
  );
}
