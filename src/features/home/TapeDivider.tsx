"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Two strips of caution tape that slide in opposite directions as the page scrolls. */
export function TapeDivider({ text }: { text: string }) {
  const root = useRef<HTMLDivElement>(null);
  const phrase = Array.from({ length: 8 }, () => text).join("  ✚  ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
        gsap.fromTo("[data-tape='a']", { xPercent: -5 }, { xPercent: -30, ease: "none", scrollTrigger: scrub });
        gsap.fromTo("[data-tape='b']", { xPercent: -30 }, { xPercent: -5, ease: "none", scrollTrigger: scrub });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="relative my-20 h-28 overflow-hidden md:my-28 md:h-36">
      <div className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 -rotate-2 bg-flare py-2.5 shadow-[0_8px_30px_rgba(0,0,0,.6)]">
        <p data-tape="a" className="whitespace-nowrap font-display text-xl font-black uppercase tracking-[0.2em] text-asphalt md:text-2xl">
          {phrase}
        </p>
      </div>
      <div className="absolute inset-x-[-10%] top-1/2 -translate-y-1/2 rotate-[1.5deg] bg-blood-deep/90 py-2">
        <p data-tape="b" className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.4em] text-bone/70">
          {phrase}
        </p>
      </div>
    </div>
  );
}
