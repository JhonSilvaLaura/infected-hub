import type { ReactNode } from "react";

/** Page heading used inside the creator and admin dashboards. */
export function DashboardTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood">{eyebrow}</p>
        <h1 className="mt-2 font-display text-5xl font-black uppercase leading-[0.9] md:text-6xl">{title}</h1>
        {description && <p className="mt-3 text-bone/70">{description}</p>}
      </div>
      {action}
    </header>
  );
}
