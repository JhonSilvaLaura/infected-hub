import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { Reveal } from "@/components/ui/Reveal";
import { SceneCard } from "@/components/scene/SceneCard";
import { SceneHeading } from "@/components/scene/SceneHeading";
import { CreatorDossiers } from "@/features/home/CreatorDossiers";
import { Hero, type HeroSlide } from "@/features/home/Hero";
import { PackShowcase } from "@/features/home/PackShowcase";
import { RecentLog } from "@/features/home/RecentLog";
import { SellBanner } from "@/features/home/SellBanner";
import { SurvivorRoster } from "@/features/home/SurvivorRoster";
import { SLOT_LABELS } from "@/lib/format";
import {
  countByCategory,
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
  getSurvivorRoster,
} from "@/services/catalog.service";

export default function HomePage() {
  const mods = getMods();
  const categories = getCategories();
  const counts = countByCategory();
  const featured = getFeaturedMods().slice(0, 3);
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
  const packs = getCollections().map((collection) => ({
    collection,
    mods: getModsBySlugs(collection.modSlugs),
    curator: getCreator(collection.curatorSlug),
  }));
  const dossiers = getCreators().map((creator) => {
    const own = getModsByCreator(creator.slug);
    return { creator, mods: own.length, downloads: own.reduce((n, m) => n + m.downloads, 0) };
  });

  return (
    <>
      <Hero slides={heroSlides} />

      <div className="mx-auto max-w-7xl space-y-24 px-4 pb-8 md:space-y-32 md:px-8">
        <div className="-mb-16 mt-6 flex justify-end md:-mb-24">
          <MockDataNotice />
        </div>

        <section aria-labelledby="destacados">
          <Reveal>
            <SceneHeading id="destacados" eyebrow="Elegidos por moderación" title="Destacados" href="/mods?sort=popular" />
          </Reveal>
          <ol className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:grid-rows-2">
            {featured.map((m, i) => (
              <li key={m.id} className={i === 0 ? "lg:row-span-2" : undefined}>
                <Reveal delay={0.08 * i} className="h-full">
                  <SceneCard
                    mod={m}
                    index={i}
                    total={featured.length}
                    lead={i === 0}
                    creator={getCreator(m.creatorSlug)}
                    category={getCategory(m.categorySlug)}
                    className={i === 0 ? "h-[440px] lg:h-full lg:min-h-[540px]" : "h-[260px]"}
                  />
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="supervivientes">
          <Reveal>
            <SceneHeading id="supervivientes" eyebrow="¿A quién le cambias la ropa?" title="Elige superviviente" href="/mods" linkLabel="Catálogo" />
          </Reveal>
          <SurvivorRoster groups={getSurvivorRoster()} categories={categories} counts={counts} />
        </section>

        <section aria-labelledby="recientes">
          <Reveal>
            <SceneHeading id="recientes" eyebrow="Recién aprobados" title="Últimas entradas" href="/mods?sort=recent" />
          </Reveal>
          <Reveal>
            <RecentLog mods={recent} categories={categories} />
          </Reveal>
        </section>

        <section id="colecciones" aria-labelledby="packs" className="scroll-mt-24">
          <Reveal>
            <SceneHeading id="packs" eyebrow="Supervivientes del mismo estilo" title="Equipos completos" href="/categorias/packs" />
          </Reveal>
          <PackShowcase packs={packs} />
        </section>

        <section id="creadores" aria-labelledby="creadores-title" className="scroll-mt-24">
          <Reveal>
            <SceneHeading id="creadores-title" eyebrow="Quién los modela" title="Creadores" href="/creadores" />
          </Reveal>
          <CreatorDossiers dossiers={dossiers} categories={categories} />
        </section>

        <Reveal>
          <SellBanner />
        </Reveal>
      </div>
    </>
  );
}
