import { CATEGORY_ICONS } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { CategorySlug, CoverTone } from "@/types/mod";

/**
 * Procedural cover art. Placeholder for creator-uploaded images (S3) until Fase 4;
 * generated so no third-party or Valve artwork is ever shipped.
 */
const TONES: Record<CoverTone, string> = {
  blood: "radial-gradient(120% 90% at 80% 10%, #8a1a26 0%, #3a0b12 45%, #120707 100%)",
  flare: "radial-gradient(120% 90% at 20% 0%, #a8480f 0%, #3d1a07 50%, #110a05 100%)",
  bile: "radial-gradient(120% 90% at 70% 100%, #4f5317 0%, #1e200a 50%, #0b0b06 100%)",
  ash: "radial-gradient(120% 90% at 50% 0%, #4a443d 0%, #1f1c19 55%, #0d0c0b 100%)",
  night: "radial-gradient(120% 90% at 30% 100%, #1c2a3a 0%, #0e141c 55%, #08090b 100%)",
};

interface ModCoverProps {
  tone: CoverTone;
  code: string;
  category: CategorySlug;
  className?: string;
  /** Larger glyph and code for hero-size placements */
  large?: boolean;
  variant?: number;
}

export function ModCover({ tone, code, category, className, large, variant = 0 }: ModCoverProps) {
  const Icon = CATEGORY_ICONS[category];
  const rotation = [-14, 9, -4, 18][variant % 4];
  return (
    <div
      className={cn("relative isolate overflow-hidden bg-soot", className)}
      style={{ background: TONES[tone] }}
      aria-hidden
    >
      <Icon
        strokeWidth={1}
        className={cn(
          "absolute text-bone/[0.13] transition-transform duration-700 ease-out group-hover:scale-110",
          large ? "-right-[8%] top-1/2 size-[85%] -translate-y-1/2" : "-right-[12%] -bottom-[18%] size-[78%]",
        )}
        style={{ rotate: `${rotation}deg` }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
      <span
        className={cn(
          "absolute left-4 top-3 font-display font-black leading-none tracking-wider text-bone/25",
          large ? "text-7xl md:text-8xl" : "text-4xl",
        )}
      >
        {code}
      </span>
      <div className="grain absolute inset-0 opacity-40" />
    </div>
  );
}
