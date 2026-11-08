"use client";

import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/cn";
import type { CoverTone } from "@/types/mod";

gsap.registerPlugin(useGSAP);

/** Background loop shared by every scene panel. Swap these files to change the scene. */
const SCENE_VIDEO = {
  webm: "/hero/survivors.webm",
  mp4: "/hero/survivors.mp4",
  poster: "/hero/survivors-poster.jpg",
};

/** Warm half of the duotone, per tone. The cold half is fixed. */
const TINTS: Record<CoverTone, string> = {
  blood: "#e0263a",
  flare: "#ff6a1a",
  bile: "#a3b02c",
  ash: "#c9452f",
  night: "#7d3cff",
};

export interface SceneSlide {
  key: string;
  tone: CoverTone;
  /** Short line above the title */
  eyebrow: ReactNode;
  title: string;
  body: ReactNode;
  /** Primary action, rendered in the chamfered button slot */
  cta: ReactNode;
  /** Top-right preview (hidden below `lg`) */
  preview?: ReactNode;
  /** Thumbnail art for the selector and its caption */
  thumb: ReactNode;
  thumbLabel: string;
  /** Extra text for the notch tab, e.g. the category */
  tab?: string;
}

interface ScenePanelProps {
  slides: SceneSlide[];
  titleId: string;
  /** Accessible name of the selector list */
  selectorLabel: string;
  /** Flickering text in the bottom-right corner */
  signal: string;
  /** Use `h2` when the page already has an `h1` */
  headingLevel?: "h1" | "h2";
  minHeight?: string;
  initial?: number;
  onSelect?: (index: number) => void;
}

/**
 * The site's signature panel: chamfered frame, duotone video, big title with a CTA,
 * a thumbnail selector and a play/pause equalizer. Switching slides re-tints the scene
 * with a short burst of interference (GSAP), skipped when reduced motion is requested.
 */
export function ScenePanel({
  slides,
  titleId,
  selectorLabel,
  signal,
  headingLevel: Heading = "h1",
  minHeight = "min-h-[min(86svh,820px)]",
  initial = 0,
  onSelect,
}: ScenePanelProps) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  /** Index shown by the last effect run; equal on re-runs (e.g. Strict Mode), so they replay the intro */
  const lastShown = useRef<number | null>(null);
  const [active, setActive] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const slide = slides[active];

  useGSAP(
    () => {
      const el = root.current!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tint = TINTS[slide.tone];

      const intro = lastShown.current === null || lastShown.current === active;
      lastShown.current = active;

      if (intro) {
        el.style.setProperty("--tint", tint);
        if (reduce) return;
        video.current?.play().then(() => setPlaying(true)).catch(() => {});
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from("[data-frame]", { autoAlpha: 0, scale: 1.02, duration: 0.8 })
          .from("[data-swap]", { yPercent: 40, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.25)
          .from("[data-thumb]", { y: 40, autoAlpha: 0, duration: 0.5, stagger: 0.06 }, 0.45)
          .from("[data-side]", { autoAlpha: 0, x: 24, duration: 0.6, stagger: 0.1 }, 0.5);
        return;
      }

      if (reduce) {
        el.style.setProperty("--tint", tint);
        return;
      }
      // Channel switch: the tint shifts, a burst of interference, and the new text drops in.
      gsap
        .timeline()
        .to(el, { "--tint": tint, duration: 0.5, ease: "power2.out" }, 0)
        .fromTo(
          "[data-glitch]",
          { autoAlpha: 0.9, y: () => gsap.utils.random(-40, 40) },
          { autoAlpha: 0, y: 0, duration: 0.4, ease: "steps(5)" },
          0,
        )
        .from("[data-swap]", { yPercent: 50, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }, 0.08);
    },
    { scope: root, dependencies: [active] },
  );

  function select(i: number) {
    setActive(i);
    onSelect?.(i);
  }

  function toggleVideo() {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <section ref={root} aria-labelledby={titleId} className="mx-auto max-w-[1600px] px-3 pt-3 md:px-6 md:pt-5">
      <div className="hero-frame-wrap relative">
        {/* Tab in the notch: what is on screen right now */}
        <p
          data-side
          className="absolute left-0 top-0 flex h-[var(--t)] w-[var(--w)] items-center gap-2 pl-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ash md:text-[11px]"
        >
          <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-blood" aria-hidden />
          {String(active + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
          {slide.tab && <span className="hidden truncate md:inline">· {slide.tab}</span>}
        </p>

        <div data-frame className="hero-frame relative bg-bone/25">
          <div className="hero-frame absolute inset-px overflow-hidden bg-asphalt">
            {/* Duotone scene: grayscale video, cold on the left, the slide's tint on the right */}
            <video
              ref={video}
              aria-hidden
              tabIndex={-1}
              muted
              loop
              playsInline
              preload="metadata"
              poster={SCENE_VIDEO.poster}
              className="absolute inset-0 size-full object-cover object-[65%_25%] contrast-125 grayscale"
            >
              <source src={SCENE_VIDEO.webm} type="video/webm" />
              <source src={SCENE_VIDEO.mp4} type="video/mp4" />
            </video>
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-color"
              style={{ background: "linear-gradient(100deg, #1b3a9e 0%, #1b3a9e 38%, var(--tint) 66%, var(--tint) 100%)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-50 mix-blend-soft-light"
              style={{ background: "linear-gradient(100deg, #0d1f6b 0%, transparent 50%, var(--tint) 100%)" }}
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-asphalt/85 via-asphalt/35 to-transparent max-md:via-asphalt/60" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-asphalt/90 to-transparent" />
            <div aria-hidden className="scanlines absolute inset-0" />
            <div
              data-glitch
              aria-hidden
              className="invisible absolute inset-0 mix-blend-screen"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent 0 22px, var(--tint) 22px 26px, transparent 26px 61px, #2a5bff 61px 63px, transparent 63px 97px)",
              }}
            />
          </div>

          <div
            className={cn(
              "relative grid grid-cols-1 grid-rows-[1fr_auto] gap-8 px-5 pb-6 pt-[calc(var(--t)+2rem)] md:px-10 md:pb-8 md:pt-[calc(var(--t)+3rem)]",
              minHeight,
            )}
          >
            <div className="flex min-w-0 items-start justify-between gap-8">
              <div className="min-w-0 max-w-xl" aria-live="polite">
                <p data-swap className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-bone/70">
                  {slide.eyebrow}
                </p>
                <Heading
                  id={titleId}
                  data-swap
                  className="font-display text-[clamp(3.2rem,9vw,8rem)] font-black uppercase leading-[0.82] tracking-tight text-bone [text-shadow:-3px_0_0_rgba(42,91,255,0.55),3px_0_0_var(--tint)]"
                >
                  {slide.title}
                </Heading>
                <div data-swap className="mt-6 max-w-md text-base text-bone/85 md:text-lg">
                  {slide.body}
                </div>
                <div data-swap className="mt-8 flex items-start">
                  {slide.cta}
                  <span aria-hidden className="h-px min-w-0 max-w-48 flex-1 bg-bone/70" />
                </div>
              </div>

              {slide.preview && (
                <div data-side className="hidden w-72 shrink-0 lg:block">
                  {slide.preview}
                </div>
              )}
            </div>

            <div className="flex min-w-0 items-end justify-between gap-6">
              <ul className="-mx-1 flex min-w-0 gap-3 overflow-x-auto px-1 pt-4 md:gap-5" aria-label={selectorLabel}>
                {slides.map((s, i) => {
                  const on = i === active;
                  return (
                    <li key={s.key} data-thumb className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={s.title}
                        onClick={() => select(i)}
                        className={cn(
                          "chamfer-tr relative block h-24 w-20 overflow-hidden border transition-[transform,border-color] duration-300 md:h-36 md:w-28",
                          on ? "-translate-y-2 border-2 border-bone" : "border-bone/30 opacity-75 hover:border-bone/70 hover:opacity-100",
                        )}
                      >
                        {s.thumb}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-asphalt/70 px-1.5 py-1 text-left font-mono text-[9px] uppercase tracking-wider text-bone/90 md:text-[10px]">
                          {s.thumbLabel}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div data-side className="hidden shrink-0 flex-col items-end gap-5 md:flex">
                <p aria-hidden className="signal max-w-[17rem] text-right text-lg leading-snug text-bone/90">
                  {`${signal} ■ `.repeat(4)}
                </p>
                <button
                  type="button"
                  onClick={toggleVideo}
                  aria-pressed={playing}
                  aria-label={playing ? "Pausar el video de fondo" : "Reproducir el video de fondo"}
                  className="flex h-10 w-20 items-end justify-center gap-[3px] border border-bone/70 px-2 pb-2 transition-colors hover:border-flare"
                >
                  {[0.45, 0.8, 0.6, 1, 0.5, 0.7].map((h, i) => (
                    <span
                      key={i}
                      className={cn("eq-bar w-1.5 bg-bone", !playing && "[animation-play-state:paused]")}
                      style={{ height: `${h * 100}%`, animationDelay: `${i * -0.17}s` }}
                    />
                  ))}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The chamfered primary button used in a scene panel's CTA slot. */
export const sceneCtaClass =
  "chamfer-br inline-flex h-12 shrink-0 items-center gap-2 bg-bone px-6 text-sm font-bold uppercase tracking-wide text-asphalt transition-colors hover:bg-flare focus-visible:outline-offset-4";
