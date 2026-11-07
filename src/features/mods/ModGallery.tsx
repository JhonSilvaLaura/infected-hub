"use client";

import { AnimatePresence, motion } from "motion/react";
import { PlayCircle } from "lucide-react";
import { useState } from "react";
import { ModCover } from "@/components/cards/ModCover";
import { cn } from "@/lib/cn";
import type { CategorySlug, CoverTone } from "@/types/mod";

interface ModGalleryProps {
  title: string;
  tone: CoverTone;
  code: string;
  category: CategorySlug;
  count: number;
  hasVideo: boolean;
}

export function ModGallery({ title, tone, code, category, count, hasVideo }: ModGalleryProps) {
  const [active, setActive] = useState(0);
  const slides = Array.from({ length: count }, (_, i) => i);

  return (
    <div>
      <div className="relative overflow-hidden rounded-[4px] border border-concrete">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ModCover tone={tone} code={code} category={category} variant={active} large className="aspect-video" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-3 right-3 rounded-[2px] bg-asphalt/80 px-2 py-1 font-mono text-[11px] text-bone/80">
          {active + 1} / {count}
        </span>
        {hasVideo && active === 0 && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-[2px] bg-asphalt/80 px-2 py-1 text-xs text-bone">
            <PlayCircle className="size-4 text-flare" aria-hidden />
            Incluye video demostrativo
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6" role="tablist" aria-label={`Galería de ${title}`}>
        {slides.map((i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-label={`Imagen ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              "overflow-hidden rounded-[3px] border-2 transition-[border-color,opacity]",
              active === i ? "border-flare" : "border-transparent opacity-60 hover:opacity-100",
            )}
          >
            <ModCover tone={tone} code="" category={category} variant={i} className="aspect-video" />
          </button>
        ))}
      </div>
    </div>
  );
}
