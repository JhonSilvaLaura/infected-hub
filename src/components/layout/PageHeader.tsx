import type { ReactNode } from "react";
import { MockDataNotice } from "@/components/ui/MockDataNotice";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-10 border-b border-concrete pb-8 pt-6 md:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood">{eyebrow}</p>
        <MockDataNotice />
      </div>
      <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] tracking-wide md:text-8xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-bone/70">{children}</div>}
    </header>
  );
}
