import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { formatCount } from "@/lib/format";
import type { Category, Creator } from "@/types/mod";

interface Dossier {
  creator: Creator;
  mods: number;
  downloads: number;
}

/** Creators as personnel files: outlined initials, specialty and numbers in mono. */
export function CreatorDossiers({ dossiers, categories }: { dossiers: Dossier[]; categories: Category[] }) {
  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5">
      {dossiers.map(({ creator, mods, downloads }, i) => (
        <li key={creator.slug} className="w-60 shrink-0 snap-start md:w-auto">
          <Reveal delay={0.05 * i} className="h-full">
            <Link
              href={`/creadores/${creator.slug}`}
              className="chamfer-tr group relative flex h-full flex-col overflow-hidden border border-bone/20 bg-soot p-4 transition-colors hover:border-bone/60"
            >
              <span aria-hidden className="scanlines absolute inset-0 opacity-50" />
              <span
                aria-hidden
                className="relative font-display text-7xl font-black uppercase leading-none text-transparent transition-colors [-webkit-text-stroke:1.5px_rgba(235,227,213,0.35)] group-hover:[-webkit-text-stroke-color:var(--flare)]"
              >
                {creator.name.slice(0, 2)}
              </span>
              <span className="relative mt-4 flex items-center gap-1.5 font-semibold">
                {creator.name}
                {creator.verified && <BadgeCheck className="size-4 text-flare" aria-label="Creador verificado" />}
              </span>
              <span className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                {categories.find((c) => c.slug === creator.specialty)?.name}
              </span>
              <span className="relative mt-3 line-clamp-2 text-xs text-bone/70">{creator.bio}</span>
              <span className="relative mt-auto flex justify-between border-t border-bone/10 pt-3 font-mono text-[11px] text-bone/80">
                <span>{mods} mods</span>
                <span>{formatCount(downloads)} desc.</span>
              </span>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
