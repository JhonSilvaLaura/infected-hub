import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COVER_TONES } from "@/components/cards/ModCover";
import { SCENE_TINTS, SURVIVOR_TONES, titleFit } from "@/components/scene/scene-style";
import { CATEGORY_ICONS } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Category, CategorySlug, CharacterSlot } from "@/types/mod";

interface RosterGroup {
  label: string;
  survivors: { slot: CharacterSlot; count: number; from: number | null; free: boolean }[];
}

interface SurvivorRosterProps {
  groups: RosterGroup[];
  categories: Category[];
  counts: Record<CategorySlug, number>;
}

/**
 * Character-select screen: the eight survivors as tall chamfered cards, each leading to the
 * catalog filtered by who the mod replaces. Mod types sit underneath as a second way in.
 */
export function SurvivorRoster({ groups, categories, counts }: SurvivorRosterProps) {
  return (
    <div className="space-y-10">
      {groups.map((group, g) => (
        <div key={group.label}>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ash">{group.label}</p>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {group.survivors.map((s, i) => (
              <li key={s.slot}>
                <Reveal delay={0.05 * (g * 4 + i)}>
                  <SurvivorCard {...s} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ash">O busca por tipo de mod</p>
        <ul className="grid gap-3 md:grid-cols-3">
          {categories
            .filter((c) => c.slug !== "packs")
            .map((c) => {
              const Icon = CATEGORY_ICONS[c.slug];
              return (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className="chamfer-tr group flex h-full items-start gap-4 border border-bone/20 bg-soot p-4 transition-colors hover:border-bone/60 hover:bg-soot-2"
                  >
                    <Icon className="mt-0.5 size-6 shrink-0 text-bone/60 transition-colors group-hover:text-flare" strokeWidth={1.5} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="font-display text-2xl font-extrabold uppercase leading-none">{c.name}</span>
                        <span className="font-mono text-[11px] text-ash">{counts[c.slug]} mods</span>
                      </span>
                      <span className="mt-1 block text-sm text-ash">{c.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}

function SurvivorCard({ slot, count, from, free }: RosterGroup["survivors"][number]) {
  const name = SLOT_LABELS[slot];
  const tone = SURVIVOR_TONES[slot];
  const empty = count === 0;
  return (
    <Link
      href={`/mods?slot=${slot}`}
      aria-label={`${name}: ${count} ${count === 1 ? "mod" : "mods"}`}
      className={cn("group relative block h-60 focus-visible:outline-none md:h-80", empty && "opacity-60")}
      style={{ ["--tint" as string]: SCENE_TINTS[tone] }}
    >
      <div className="scene-card absolute inset-0 bg-bone/20 transition-colors duration-300 group-hover:bg-bone/70 group-focus-visible:bg-flare" />
      <div className="scene-card absolute inset-px overflow-hidden" style={{ background: COVER_TONES[tone] }}>
        {/* Giant outlined initial: the survivor's mark without using any game art */}
        <span
          aria-hidden
          className="absolute -bottom-[0.18em] -right-[0.06em] font-display text-[11rem] font-black uppercase leading-none text-transparent transition-transform duration-700 ease-out [-webkit-text-stroke:1.5px_rgba(235,227,213,0.24)] group-hover:-translate-y-2 md:text-[15rem]"
        >
          {name[0]}
        </span>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/40 to-transparent" />
        <div aria-hidden className="scanlines absolute inset-0" />
        <div
          aria-hidden
          className="scene-glitch pointer-events-none absolute inset-0 opacity-0 mix-blend-screen"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent 0 18px, var(--tint) 18px 21px, transparent 21px 47px, #2a5bff 47px 49px, transparent 49px 80px)",
          }}
        />
      </div>

      <div className="relative flex h-full flex-col justify-between p-4 md:p-5">
        <p className="flex flex-col gap-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-bone/75 sm:flex-row sm:justify-between md:text-[11px] md:tracking-[0.2em]">
          <span>{String(count).padStart(2, "0")} mods</span>
          <span>{from !== null ? `desde ${formatPrice(from)}` : free ? "gratis" : "—"}</span>
        </p>
        <div className="@container">
          <p
            style={titleFit(name, "clamp(2.6rem,5vw,3.75rem)")}
            className="title-fit font-display font-black uppercase leading-[0.85] tracking-tight text-bone [text-shadow:-2px_0_0_rgba(42,91,255,0.55),2px_0_0_var(--tint)]"
          >
            {name}
          </p>
          <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-bone/70 transition-colors group-hover:text-flare">
            {empty ? "Sin mods todavía" : "Ver sus mods"}
            {!empty && <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />}
          </p>
        </div>
      </div>
    </Link>
  );
}
