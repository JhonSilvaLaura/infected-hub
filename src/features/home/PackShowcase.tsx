import Link from "next/link";
import { ModCover } from "@/components/cards/ModCover";
import { SCENE_TINTS, sceneCtaClass } from "@/components/scene/scene-style";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice, SLOT_LABELS } from "@/lib/format";
import type { Collection, Creator, Mod } from "@/types/mod";

interface Pack {
  collection: Collection;
  mods: Mod[];
  curator?: Creator;
}

/** Packs as full crews: four survivor thumbnails in a row, like the hero selector. */
export function PackShowcase({ packs }: { packs: Pack[] }) {
  return (
    <ul className="grid gap-5 lg:grid-cols-3">
      {packs.map(({ collection, mods, curator }, i) => {
        const total = mods.reduce((n, m) => n + (m.price ?? 0), 0);
        return (
          <li key={collection.slug}>
            <Reveal delay={0.08 * i} className="h-full">
              <article
                aria-labelledby={`pack-${collection.slug}`}
                className="relative h-full"
                style={{ ["--tint" as string]: SCENE_TINTS[collection.tone] }}
              >
                <div className="scene-card absolute inset-0 bg-bone/20" />
                <div className="scene-card relative m-px flex h-[calc(100%-2px)] flex-col overflow-hidden bg-soot p-5 md:p-6">
                  <div aria-hidden className="scanlines absolute inset-0 opacity-50" />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1/2 opacity-30"
                    style={{ background: "radial-gradient(80% 100% at 80% 0%, var(--tint), transparent 70%)" }}
                  />
                  <p className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
                    Pack · {mods.length} supervivientes{curator && ` · por ${curator.name}`}
                  </p>
                  <h3
                    id={`pack-${collection.slug}`}
                    className="relative mt-2 font-display text-4xl font-black uppercase leading-[0.86] tracking-tight [text-shadow:-2px_0_0_rgba(42,91,255,0.5),2px_0_0_var(--tint)]"
                  >
                    {collection.title}
                  </h3>
                  <p className="relative mt-3 text-sm text-bone/75">{collection.summary}</p>

                  <ul className="relative mt-5 grid grid-cols-4 gap-2">
                    {mods.map((m) => (
                      <li key={m.id}>
                        <Link
                          href={`/mods/${m.slug}`}
                          aria-label={m.title}
                          className="chamfer-tr relative block aspect-[3/4] overflow-hidden border border-bone/30 transition-colors hover:border-bone"
                        >
                          <ModCover tone={m.cover.tone} code="" category={m.categorySlug} className="absolute inset-0" />
                          <span className="absolute inset-x-0 bottom-0 truncate bg-asphalt/75 px-1 py-0.5 font-mono text-[9px] uppercase tracking-wider">
                            {SLOT_LABELS[m.replaces]}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-auto flex items-center gap-3 pt-6">
                    <Link href="/categorias/packs" className={`${sceneCtaClass} h-10 px-4 text-xs`}>
                      Ver el pack
                    </Link>
                    <span aria-hidden className="h-px min-w-0 flex-1 bg-bone/40" />
                    <span className="font-mono text-xs text-bone/80">{total ? `${formatPrice(total)} por separado` : "Todo gratis"}</span>
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
