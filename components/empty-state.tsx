import { LinkButton } from "@/components/button";

export function EmptyState({
  title,
  text,
  href,
  action
}: {
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-ink/20 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{text}</p>
      <LinkButton href={href} className="mt-5">
        {action}
      </LinkButton>
    </div>
  );
}
