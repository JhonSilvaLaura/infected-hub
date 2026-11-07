import Link from "next/link";
import { BadgeCheck, FileCheck2, ScanSearch, ShieldCheck } from "lucide-react";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { ModCard } from "@/components/cards/ModCard";
import { ModCover } from "@/components/cards/ModCover";
import { buttonClass } from "@/components/ui/Button";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hero, type HeroSlide } from "@/features/home/Hero";
import { TapeDivider } from "@/features/home/TapeDivider";
import { formatCount, formatDate, SLOT_GROUPS, SLOT_LABELS } from "@/lib/format";
import {
  countByCategory,
  countBySlot,
  getCategories,
  getCategory,
  getCollections,
  getCreator,
  getCreators,
  getFeaturedMods,
  getMods,
  getModsByCreator,
  getModsBySlugs,
  getRecentMods,
} from "@/services/catalog.service";


export default function HomePage() {
  const mods = getMods();
  const categories = getCategories();
  const counts = countByCategory();
  const bySlot = countBySlot();
  const [lead, ...restFeatured] = getFeaturedMods();
  const heroSlides: HeroSlide[] = [...mods]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map((m) => ({
      slug: m.slug,
      title: m.title,
      summary: m.summary,
      price: m.price,
      category: getCategory(m.categorySlug)?.name ?? "",
      categorySlug: m.categorySlug,
      replaces: SLOT_LABELS[m.replaces],
      tone: m.cover.tone,
      code: m.cover.code,
    }));
  const recent = getRecentMods(6);
  const collections = getCollections();
  const creators = getCreators();

  return (
    <>
      <Hero slides={heroSlides} />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 mt-6 flex justify-end">
          <MockDataNotice />
        </div>

        {/* Destacados */}
        <section aria-labelledby="destacados">
          <Reveal>
            <SectionHeading eyebrow="Elegidos por moderación" title={<span id="destacados">Destacados</span>} href="/mods?sort=popular" />
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Reveal>
              <ModCard mod={lead} size="large" creator={getCreator(lead.creatorSlug)} category={getCategory(lead.categorySlug)} className="h-full" />
            </Reveal>
            <div className="grid gap-5">
              {restFeatured.map((m, i) => (
                <Reveal key={m.id} delay={0.08 * (i + 1)}>
                  <ModCard mod={m} creator={getCreator(m.creatorSlug)} category={getCategory(m.categorySlug)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </div>

      <TapeDivider text="Solo modelos propios o con permiso" />

      <div className="mx-auto max-w-7xl space-y-28 px-4 md:px-8">
        {/* Categorías */}
        <section aria-labelledby="categorias">
          <Reveal>
            <SectionHeading eyebrow="Seis cajas de suministros" title={<span id="categorias">Categorías</span>} href="/categorias" />
          </Reveal>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {categories.map((c, i) => (
              <li key={c.slug}>
                <Reveal delay={0.03 * i} className="h-full">
                  <CategoryCard category={c} count={counts[c.slug]} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Por personaje */}
        <section aria-labelledby="personajes">
          <Reveal>
            <SectionHeading eyebrow="¿A quién quieres cambiar?" title={<span id="personajes">Por personaje</span>} />
          </Reveal>
          <div className="grid gap-px overflow-hidden rounded-[4px] border border-concrete bg-concrete md:grid-cols-3">
            {SLOT_GROUPS.map((g) => (
              <div key={g.label} className="bg-soot p-5 md:p-6">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ash">{g.label}</p>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {g.slots.map((slot) => {
                    const n = bySlot[slot] ?? 0;
                    return (
                      <li key={slot}>
                        <Link
                          href={`/mods?slot=${slot}`}
                          className={`group inline-flex items-baseline gap-1.5 font-display text-2xl font-extrabold uppercase tracking-wide transition-colors hover:text-flare md:text-3xl ${n ? "text-bone" : "text-bone/30"}`}
                        >
                          {SLOT_LABELS[slot]}
                          <span className="font-mono text-[11px] font-normal text-ash group-hover:text-flare">{n}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Recientes */}
        <section aria-labelledby="recientes">
          <Reveal>
            <SectionHeading eyebrow="Recién aprobados" title={<span id="recientes">Recientes</span>} href="/mods?sort=recent" />
          </Reveal>
          <ol className="divide-y divide-concrete border-y border-concrete">
            {recent.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/mods/${m.slug}`}
                  className="group grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-soot md:grid-cols-[96px_1.2fr_1fr_auto] md:gap-6 md:px-3"
                >
                  <ModCover tone={m.cover.tone} code="" category={m.categorySlug} className="aspect-square rounded-[3px]" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-extrabold uppercase tracking-wide text-bone group-hover:text-flare md:text-2xl">
                      {m.title}
                    </p>
                    <p className="truncate text-xs text-ash">
                      {getCategory(m.categorySlug)?.name} · {getCreator(m.creatorSlug)?.name}
                    </p>
                  </div>
                  <p className="hidden truncate text-sm text-ash md:block">{m.summary}</p>
                  <time dateTime={m.publishedAt} className="font-mono text-xs text-ash">
                    {formatDate(m.publishedAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Colecciones */}
        <section id="colecciones" aria-labelledby="colecciones-title" className="scroll-mt-24">
          <Reveal>
            <SectionHeading eyebrow="Personajes del mismo estilo" title={<span id="colecciones-title">Packs</span>} />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {collections.map((col, i) => (
              <Reveal key={col.slug} delay={0.08 * i}>
                <CollectionCard collection={col} mods={getModsBySlugs(col.modSlugs)} curator={getCreator(col.curatorSlug)} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Creadores */}
        <section id="creadores" aria-labelledby="creadores-title" className="scroll-mt-24">
          <Reveal>
            <SectionHeading eyebrow="Quienes modelan los personajes" title={<span id="creadores-title">Creadores destacados</span>} href="/creadores" />
          </Reveal>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c, i) => {
              const theirMods = getModsByCreator(c.slug);
              const downloads = theirMods.reduce((sum, m) => sum + m.downloads, 0);
              return (
                <li key={c.slug}>
                  <Reveal delay={0.05 * i}>
                    <Link
                      href={`/creadores/${c.slug}`}
                      className="flex items-center gap-4 rounded-[4px] border border-concrete bg-soot p-4 transition-colors hover:border-flare/60"
                    >
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-[3px] bg-concrete font-display text-2xl font-black text-bone">
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-semibold text-bone">
                          {c.name}
                          {c.verified && <BadgeCheck className="size-4 text-flare" aria-label="Creador verificado" />}
                        </p>
                        <p className="truncate text-xs text-ash">{c.bio}</p>
                        <p className="mt-1 font-mono text-[11px] text-bone/60">
                          {theirMods.length} mods · {formatCount(downloads)} descargas
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Comunidad / publicar */}
        <section id="publicar" aria-labelledby="publicar-title" className="scroll-mt-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-[4px] border border-concrete bg-soot">
              <div className="hazard absolute inset-y-0 left-0 w-2" aria-hidden />
              <div className="grid gap-10 p-6 pl-10 md:grid-cols-[1.1fr_1fr] md:p-12 md:pl-16">
                <div>
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-blood">Para creadores</p>
                  <h2 id="publicar-title" className="font-display text-5xl font-black uppercase leading-[0.9] md:text-7xl">
                    Tu personaje, con tu nombre.
                  </h2>
                  <p className="mt-5 max-w-md text-bone/75">
                    Publica tus modelos, ponles precio, gestiona versiones y mira cuántas personas los usan. Antes de
                    publicar, acreditas que el modelo es tuyo o que tienes permiso para distribuirlo.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link href="/vender" className={buttonClass({ variant: "primary" })}>
                      Vende tus mods
                    </Link>
                    <span className="font-mono text-xs uppercase tracking-wider text-ash">Te quedas el 80% de cada venta</span>
                  </div>
                </div>
                <ol className="space-y-5">
                  {[
                    { icon: FileCheck2, title: "Sube y declara la licencia", body: "Archivo, capturas, personaje que reemplaza, precio y licencia." },
                    { icon: ScanSearch, title: "Análisis del archivo", body: "Se valida tipo, tamaño y se analiza contra malware." },
                    { icon: ShieldCheck, title: "Revisión de moderación", body: "Un moderador aprueba o te explica qué corregir." },
                  ].map((step, i) => (
                    <li key={step.title} className="flex gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-[3px] border border-concrete-2 font-mono text-sm text-flare">
                        {i + 1}
                      </span>
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-bone">
                          <step.icon className="size-4 text-ash" aria-hidden />
                          {step.title}
                        </p>
                        <p className="text-sm text-ash">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
          <div className="mt-6 flex justify-center">
            <Link href="/mods" className={buttonClass({ variant: "outline" })}>
              Mientras tanto, explora el catálogo
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
