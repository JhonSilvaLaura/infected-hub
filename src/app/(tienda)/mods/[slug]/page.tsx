import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteSkeleton } from "@/components/layout/RouteSkeleton";
import { Suspense } from "react";
import { AlertTriangle, ArrowRight, BadgeCheck, Check, ChevronRight, Repeat2, Scale } from "lucide-react";
import { ModCard } from "@/components/cards/ModCard";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating, Stars } from "@/components/ui/Rating";
import { ModActions } from "@/features/mods/ModActions";
import { ModGallery } from "@/features/mods/ModGallery";
import { ModTabs } from "@/features/mods/ModTabs";
import { formatCount, formatDate, PART_LABELS, SLOT_LABELS } from "@/lib/format";
import {
  getCategory,
  getCreator,
  getMod,
  getMods,
  getRelatedMods,
  getReviews,
} from "@/services/catalog.service";
import { getLibrary, ownsMod } from "@/services/store.service";
import { findConflicts } from "@/features/store/conflicts";

export function generateStaticParams() {
  return getMods().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mods/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const mod = getMod(slug);
  return mod ? { title: mod.title, description: mod.summary } : { title: "Mod no encontrado" };
}

export default function ModDetailPage({ params }: PageProps<"/mods/[slug]">) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      {params.then(({ slug }) => (
        <ModDetail slug={slug} />
      ))}
    </Suspense>
  );
}

async function ModDetail({ slug }: { slug: string }) {
  const mod = getMod(slug);
  if (!mod) notFound();

  const creator = getCreator(mod.creatorSlug);
  const category = getCategory(mod.categorySlug);
  const reviews = getReviews(mod);
  const related = getRelatedMods(mod);
  const owned = ownsMod(mod.id);
  // Library mods that would fight this one for the same character parts
  const clashes = owned
    ? []
    : (findConflicts([mod, ...getLibrary().map((i) => i.mod)]).find((g) => g.items.some((m) => m.id === mod.id))?.items ?? []).filter(
        (m) => m.id !== mod.id,
      );

  const specs = [
    { label: "Versión", value: `v${mod.version}` },
    { label: "Build del juego", value: mod.gameBuild },
    { label: "Tamaño", value: `${mod.fileSizeMb} MB` },
    { label: "Descargas", value: formatCount(mod.downloads) },
    { label: "Publicado", value: formatDate(mod.publishedAt) },
    { label: "Actualizado", value: formatDate(mod.updatedAt) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8 md:pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ruta de navegación">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-ash">
            <li className="flex items-center gap-1"><Link href="/mods" className="hover:text-bone">Catálogo</Link><ChevronRight className="size-3" aria-hidden /></li>
            <li className="flex items-center gap-1"><Link href={`/categorias/${mod.categorySlug}`} className="hover:text-bone">{category?.name}</Link><ChevronRight className="size-3" aria-hidden /></li>
            <li aria-current="page" className="text-bone">{mod.title}</li>
          </ol>
        </nav>
        <MockDataNotice />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <ModGallery
          title={mod.title}
          tone={mod.cover.tone}
          code={mod.cover.code}
          category={mod.categorySlug}
          count={mod.galleryCount}
          hasVideo={mod.hasVideo}
        />

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood">{category?.name}</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-[0.88] tracking-wide md:text-7xl">{mod.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ash">
              por{" "}
              <Link href={`/creadores/${mod.creatorSlug}`} className="font-semibold text-bone hover:text-flare">
                {creator?.name}
              </Link>
            </span>
            {creator?.verified && <BadgeCheck className="size-4 text-flare" aria-label="Creador verificado" />}
            <Rating value={mod.rating} count={mod.ratingCount} />
          </div>
          <p className="mt-5 text-bone/75">{mod.summary}</p>

          <div className="mt-6 flex items-center gap-3">
            <PriceTag price={mod.price} className="h-7 text-xs" />
            <span className="rounded-[2px] border border-bile/50 px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-bile">
              Aprobado por moderación
            </span>
          </div>

          <div className="mt-6">
            <ModActions modId={mod.id} title={mod.title} price={mod.price} owned={owned} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-concrete bg-concrete">
            {specs.map((s) => (
              <div key={s.label} className="bg-soot p-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{s.label}</dt>
                <dd className="mt-1 font-semibold text-bone">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-[4px] border border-concrete bg-soot p-4">
            <p className="flex items-center gap-2 text-sm">
              <Repeat2 className="size-4 text-flare" aria-hidden />
              <span className="text-ash">Reemplaza a</span>
              <span className="font-semibold">{SLOT_LABELS[mod.replaces]}</span>
            </p>
            <p className="mb-2 mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Incluye</p>
            <ul className="space-y-1.5 text-sm">
              {mod.includes.map((part) => (
                <li key={part} className="flex items-center gap-2 text-bone/85">
                  <Check className="size-3.5 text-bile" aria-hidden />
                  {PART_LABELS[part]}
                </li>
              ))}
            </ul>
            {clashes.length > 0 && (
              <p className="mt-4 flex gap-2 rounded-[3px] border border-flare/40 bg-flare/[0.06] p-3 text-xs text-bone/85">
                <AlertTriangle className="size-4 shrink-0 text-flare" aria-hidden />
                <span>
                  Ya tienes {clashes.map((m) => m.title).join(", ")} para {SLOT_LABELS[mod.replaces]}. Solo uno puede estar
                  activo a la vez; podrás elegir cuál en tu biblioteca.
                </span>
              </p>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <ModTabs
          tabs={[
            {
              id: "descripcion",
              label: "Descripción",
              content: (
                <div className="space-y-4 text-bone/80">
                  {mod.description.map((p) => <p key={p}>{p}</p>)}
                  {mod.tags.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5 pt-2">
                      {mod.tags.map((t) => (
                        <li key={t}>
                          <Link href={`/mods?q=${encodeURIComponent(t)}`} className="rounded-[2px] border border-concrete px-2 py-1 text-xs text-ash hover:border-flare hover:text-flare">
                            #{t}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ),
            },
            {
              id: "instalacion",
              label: "Instalación",
              content: (
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 font-semibold">Requisitos</h3>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-bone/80 marker:text-blood">
                      {mod.requirements.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-3 font-semibold">Pasos</h3>
                    <ol className="space-y-3 text-sm text-bone/80">
                      {mod.install.map((step, i) => (
                        <li key={step} className="flex gap-3">
                          <span className="font-mono text-flare">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ),
            },
            {
              id: "versiones",
              label: "Versiones",
              content: (
                <ol className="relative space-y-6 border-l border-concrete pl-6">
                  {mod.changelog.map((v, i) => (
                    <li key={v.version} className="relative">
                      <span className={`absolute -left-[29px] top-1.5 size-2.5 rounded-full ${i === 0 ? "bg-flare" : "bg-concrete-2"}`} aria-hidden />
                      <p className="font-mono text-sm">
                        <span className="text-bone">v{v.version}</span>
                        <span className="text-ash"> · {formatDate(v.date)}</span>
                        {i === 0 && <span className="ml-2 text-[11px] uppercase tracking-wider text-flare">Actual</span>}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-bone/75">
                        {v.notes.map((n) => <li key={n}>{n}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
              ),
            },
            {
              id: "licencia",
              label: "Licencia",
              content: (
                <div className="rounded-[4px] border border-concrete bg-soot p-5">
                  <p className="flex items-center gap-2 font-semibold">
                    <Scale className="size-4 text-flare" aria-hidden />
                    {mod.license.name}
                  </p>
                  <p className="mt-2 text-sm text-bone/75">{mod.license.terms}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-ash">Redistribución</dt>
                      <dd>{mod.license.allowsRedistribution ? "Permitida con crédito" : "No permitida"}</dd>
                    </div>
                    <div>
                      <dt className="text-ash">Uso comercial</dt>
                      <dd>{mod.license.allowsCommercialUse ? "Autorizado por el creador" : "No permitido"}</dd>
                    </div>
                  </dl>
                </div>
              ),
            },
          ]}
        />

        {/* Valoraciones */}
        <section aria-labelledby="valoraciones">
          <h2 id="valoraciones" className="font-display text-3xl font-black uppercase">Valoraciones</h2>
          <div className="mt-4 flex items-center gap-4 border-b border-concrete pb-5">
            <span className="font-display text-6xl font-black leading-none">{mod.rating.toFixed(1)}</span>
            <div>
              <Stars value={mod.rating} size="md" />
              <p className="mt-1 text-xs text-ash">{mod.ratingCount.toLocaleString("es")} valoraciones</p>
            </div>
          </div>
          <ul className="divide-y divide-concrete">
            {reviews.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{r.author}</p>
                  <time dateTime={r.date} className="font-mono text-[11px] text-ash">{formatDate(r.date)}</time>
                </div>
                <Stars value={r.rating} />
                <p className="mt-2 text-sm text-bone/75">{r.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 rounded-[3px] border border-dashed border-concrete-2 p-3 text-xs text-ash">
            Para valorar o comentar necesitarás una cuenta. Las cuentas llegan en la próxima fase.
          </p>
        </section>
      </div>

      {creator && (
        <section id="creador" aria-labelledby="creador-title" className="mt-16 scroll-mt-24 rounded-[4px] border border-concrete bg-soot p-6 md:flex md:items-center md:gap-6">
          <span className="mb-4 flex size-16 shrink-0 items-center justify-center rounded-[3px] bg-concrete font-display text-3xl font-black md:mb-0">
            {creator.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex-1">
            <h2 id="creador-title" className="flex items-center gap-2 text-lg font-semibold">
              {creator.name}
              {creator.verified && <BadgeCheck className="size-4 text-flare" aria-label="Creador verificado" />}
            </h2>
            <p className="text-sm text-ash">{creator.bio}</p>
            <p className="mt-1 font-mono text-[11px] text-bone/60">En la plataforma desde {formatDate(creator.joinedAt)}</p>
          </div>
          <Link
            href={`/creadores/${creator.slug}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-flare hover:underline md:mt-0"
          >
            Más de este creador
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="mt-16">
          <h2 id="relacionados" className="mb-6 font-display text-4xl font-black uppercase">También te puede servir</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((m) => (
              <li key={m.id}>
                <ModCard mod={m} creator={getCreator(m.creatorSlug)} category={getCategory(m.categorySlug)} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
