"use client";

import Link from "next/link";
import { ModCover } from "@/components/cards/ModCover";
import { ScenePanel } from "@/components/scene/ScenePanel";
import { sceneCtaClass } from "@/components/scene/scene-style";
import { formatPrice } from "@/lib/format";
import type { CategorySlug, CoverTone } from "@/types/mod";

export interface HeroSlide {
  slug: string;
  title: string;
  summary: string;
  price: number | null;
  category: string;
  categorySlug: CategorySlug;
  replaces: string;
  tone: CoverTone;
  code: string;
}

/** Landing hero: the most downloaded mods in the scene panel. */
export function Hero({ slides }: { slides: HeroSlide[] }) {
  return (
    <ScenePanel
      titleId="hero-title"
      selectorLabel="Elegir personaje destacado"
      signal="SEÑAL DE INFECCIÓN DETECTADA"
      slides={slides.map((s) => ({
        key: s.slug,
        tone: s.tone,
        tab: s.category,
        eyebrow: `Reemplaza a ${s.replaces}`,
        title: s.title,
        body: <p className="line-clamp-3">{s.summary}</p>,
        cta: (
          <Link href={`/mods/${s.slug}`} className={sceneCtaClass}>
            {s.price === null ? "Descargar gratis" : `Comprar · ${formatPrice(s.price)}`}
          </Link>
        ),
        preview: (
          <Link href={`/mods/${s.slug}`} className="group block" aria-label={`Ver la ficha de ${s.title}`}>
            <span className="chamfer-tr relative block aspect-[16/9] overflow-hidden border border-bone/40">
              <ModCover tone={s.tone} code={s.code} category={s.categorySlug} className="absolute inset-0" />
              <span aria-hidden className="scanlines absolute inset-0" />
            </span>
            <span className="mt-3 block text-right text-sm font-semibold text-bone group-hover:text-flare">
              &gt; Ver la ficha completa
            </span>
          </Link>
        ),
        thumb: <ModCover tone={s.tone} code="" category={s.categorySlug} className="absolute inset-0" />,
        thumbLabel: s.replaces,
      }))}
    />
  );
}
