import Link from "next/link";
import { ModCover } from "@/components/cards/ModCover";
import { formatPrice, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Category, Creator, Mod } from "@/types/mod";
import { SCENE_TINTS, sceneCtaClass, titleFit } from "./scene-style";

interface SceneCardProps {
  mod: Mod;
  creator?: Creator;
  category?: Category;
  index: number;
  total: number;
  /** The big card shows the summary and uses the hero's title sizes */
  lead?: boolean;
  className?: string;
}

/**
 * A mod in the hero's language: chamfered frame, duotone cover tinted with the mod's tone,
 * scanlines, notch tab, chromatic title and the chamfered CTA. The whole card is one link.
 */
export function SceneCard({
  mod,
  creator,
  category,
  index,
  total,
  lead,
  className,
}: SceneCardProps) {
  const tint = SCENE_TINTS[mod.cover.tone];
  return (
    <Link
      href={`/mods/${mod.slug}`}
      aria-label={`${mod.title}, reemplaza a ${SLOT_LABELS[mod.replaces]}, ${formatPrice(mod.price)}`}
      className={cn(
        "group relative block focus-visible:outline-none",
        className,
      )}
      style={{ ["--tint" as string]: tint }}
    >
      {/* 1px border drawn by the outer chamfered layer */}
      <div className="scene-card absolute inset-0 bg-bone/25 transition-colors duration-300 group-hover:bg-bone/70 group-focus-visible:bg-flare" />
      <div className="scene-card absolute inset-px overflow-hidden bg-asphalt">
        <ModCover
          tone={mod.cover.tone}
          code=""
          category={mod.categorySlug}
          large={lead}
          className="absolute inset-0 grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0 mix-blend-color"
          style={{
            background:
              "linear-gradient(110deg, #1b3a9e 0%, #1b3a9e 30%, var(--tint) 70%, var(--tint) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-asphalt via-asphalt/55 to-asphalt/10"
        />
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

      <div
        className={cn(
          "relative flex h-full flex-col justify-between",
          lead ? "p-6 md:p-8" : "p-5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70 md:text-[11px]">
            <span aria-hidden className="size-1.5 rounded-full bg-blood" />
            {String(index + 1).padStart(2, "0")}/
            {String(total).padStart(2, "0")}
            {category && <span className="truncate">· {category.name}</span>}
          </p>
          <span className="font-mono text-[11px] text-bone/80">
            ★ {mod.rating.toFixed(1)}
          </span>
        </div>

        <div className="@container min-w-0">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-bone/70">
            Reemplaza a {SLOT_LABELS[mod.replaces]}
          </p>
          <h3
            style={lead ? titleFit(mod.title) : titleFit(mod.title, "clamp(1.8rem,3vw,2.6rem)")}
            className={cn(
              "line-clamp-2 pb-[0.04em] font-display font-black uppercase leading-[0.86] tracking-tight text-bone [text-shadow:-2px_0_0_rgba(42,91,255,0.55),2px_0_0_var(--tint)]",
              "title-fit",
            )}
          >
            {mod.title}
          </h3>
          {lead && (
            <p className="mt-4 line-clamp-2 max-w-md text-bone/80">
              {mod.summary}
            </p>
          )}
          <div className={cn("flex items-center", lead ? "mt-6" : "mt-4")}>
            <span className={cn(sceneCtaClass, !lead && "h-10 px-4 text-xs")}>
              {mod.price === null ? "Gratis" : formatPrice(mod.price)}
            </span>
            <span aria-hidden className="h-px min-w-0 flex-1 bg-bone/50" />
            {creator && (
              <span className="ml-3 truncate font-mono text-[11px] text-bone/70">
                por {creator.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
