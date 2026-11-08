import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SCENE_TINTS } from "@/components/scene/scene-style";
import { formatDate, formatPrice, SLOT_LABELS } from "@/lib/format";
import type { Category, Mod } from "@/types/mod";

/** Newest approvals as a terminal-style entry log inside a chamfered panel. */
export function RecentLog({ mods, categories }: { mods: Mod[]; categories: Category[] }) {
  return (
    <div className="relative">
      <div className="scene-card absolute inset-0 bg-bone/20" />
      <div className="scene-card relative m-px overflow-hidden bg-soot">
        <div aria-hidden className="scanlines absolute inset-0 opacity-60" />
        <p className="relative flex items-center gap-2 border-b border-bone/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ash md:px-8">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-bile" />
          &gt; registro de entradas · aprobado por moderación
        </p>
        <ol className="relative divide-y divide-bone/10">
          {mods.map((m) => (
            <li key={m.id}>
              <Link
                href={`/mods/${m.slug}`}
                style={{ ["--tint" as string]: SCENE_TINTS[m.cover.tone] }}
                className="group relative grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--tint)_10%,transparent)] md:grid-cols-[7rem_1fr_auto_auto] md:px-8"
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-[var(--tint)] opacity-0 transition-opacity group-hover:opacity-100" />
                <time dateTime={m.publishedAt} className="col-span-2 font-mono text-[11px] uppercase text-ash md:col-span-1">
                  {formatDate(m.publishedAt)}
                </time>
                <span className="min-w-0">
                  <span className="block truncate font-display text-2xl font-extrabold uppercase leading-none text-bone transition-colors group-hover:text-flare md:text-3xl">
                    {m.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-ash">
                    Reemplaza a {SLOT_LABELS[m.replaces]} · {categories.find((c) => c.slug === m.categorySlug)?.name}
                  </span>
                </span>
                <span className="chamfer-br bg-bone/90 px-3 py-1.5 font-mono text-xs font-semibold text-asphalt">{formatPrice(m.price)}</span>
                <ArrowRight className="hidden size-4 text-ash transition-transform group-hover:translate-x-1 group-hover:text-bone md:block" aria-hidden />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
