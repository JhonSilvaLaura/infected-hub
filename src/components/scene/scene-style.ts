import type { CSSProperties } from "react";
import type { CoverTone } from "@/types/mod";

/* Shared by the client ScenePanel and the server SceneCard, so it must stay free of "use client". */

/** Warm half of the duotone, per tone. The cold half is fixed. */
export const SCENE_TINTS: Record<CoverTone, string> = {
  blood: "#e0263a",
  flare: "#ff6a1a",
  bile: "#a3b02c",
  ash: "#c9452f",
  night: "#7d3cff",
};

/** Base size by total length: long titles get smaller so they fit in two lines. */
function titleBase(title: string) {
  if (title.length <= 12) return "clamp(3rem,9vw,8rem)";
  if (title.length <= 20) return "clamp(2.5rem,6.4vw,6rem)";
  return "clamp(2.1rem,4.8vw,4.6rem)";
}

/**
 * Inline style for a `.title-fit` heading. The size is the base size, capped so the longest
 * word (which can't wrap) fits the width of the nearest `@container`.
 */
export function titleFit(title: string, base = titleBase(title)): CSSProperties {
  const longest = Math.max(...title.split(/\s+/).map((w) => w.length));
  return { "--title-size": base, "--chars": longest } as CSSProperties;
}

/** The chamfered primary button used in a scene panel's CTA slot. */
export const sceneCtaClass =
  "chamfer-br inline-flex h-12 shrink-0 items-center gap-2 bg-bone px-6 text-sm font-bold uppercase tracking-wide text-asphalt transition-colors hover:bg-flare focus-visible:outline-offset-4";
