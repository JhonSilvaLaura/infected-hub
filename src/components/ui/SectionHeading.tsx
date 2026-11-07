import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  href?: string;
  linkLabel?: string;
}

export function SectionHeading({ eyebrow, title, href, linkLabel = "Ver todo" }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-blood">{eyebrow}</p>
        <h2 className="font-display text-4xl font-black uppercase leading-none tracking-wide text-bone md:text-6xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-bone/80 hover:text-flare"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
