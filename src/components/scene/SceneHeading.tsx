import Link from "next/link";
import type { ReactNode } from "react";

interface SceneHeadingProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  href?: string;
  linkLabel?: string;
}

/** Section heading in the hero's language: signal dot, stencil title and a rule that runs to the link. */
export function SceneHeading({ id, eyebrow, title, href, linkLabel = "Ver todo" }: SceneHeadingProps) {
  return (
    <div className="mb-8">
      <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-ash">
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-blood" />
        {eyebrow}
      </p>
      <div className="flex items-end gap-4">
        <h2 id={id} className="font-display text-4xl font-black uppercase leading-[0.85] tracking-tight text-bone md:text-6xl">
          {title}
        </h2>
        <span aria-hidden className="mb-2 h-px min-w-6 flex-1 bg-bone/25" />
        {href && (
          <Link href={href} className="mb-1 shrink-0 text-sm font-semibold text-bone/80 hover:text-flare">
            &gt; {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
