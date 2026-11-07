import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck } from "lucide-react";
import { RouteSkeleton } from "@/components/layout/RouteSkeleton";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { CreatorModsGrid } from "@/features/store/CreatorModsGrid";
import { CATEGORY_ICONS } from "@/components/ui/icons";
import { formatCount, formatDate } from "@/lib/format";
import { getCategories, getCategory, getCreator, getCreators, getModsByCreator } from "@/services/catalog.service";

export function generateStaticParams() {
  return getCreators().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/creadores/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const creator = getCreator(slug);
  return creator ? { title: creator.name, description: creator.bio } : { title: "Creador no encontrado" };
}

export default function CreatorProfilePage({ params }: PageProps<"/creadores/[slug]">) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      {params.then(({ slug }) => (
        <CreatorProfile slug={slug} />
      ))}
    </Suspense>
  );
}

async function CreatorProfile({ slug }: { slug: string }) {
  const creator = getCreator(slug);
  if (!creator) notFound();
  const mods = getModsByCreator(slug);
  const downloads = mods.reduce((n, m) => n + m.downloads, 0);
  const ratings = mods.reduce((n, m) => n + m.ratingCount, 0);
  const average = ratings ? mods.reduce((n, m) => n + m.rating * m.ratingCount, 0) / ratings : 0;
  const Icon = CATEGORY_ICONS[creator.specialty];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="mb-6 flex justify-end">
        <MockDataNotice />
      </div>
      <header className="relative overflow-hidden rounded-[4px] border border-concrete bg-soot p-6 md:p-10">
        <Icon className="absolute -right-8 -top-8 size-64 text-bone/[0.04]" strokeWidth={1} aria-hidden />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <span className="flex size-24 shrink-0 items-center justify-center rounded-[4px] bg-concrete font-display text-5xl font-black">
            {creator.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood">{getCategory(creator.specialty)?.name}</p>
            <h1 className="mt-1 flex items-center gap-3 font-display text-5xl font-black uppercase leading-none md:text-7xl">
              {creator.name}
              {creator.verified && <BadgeCheck className="size-8 shrink-0 text-flare" aria-label="Creador verificado" />}
            </h1>
            <p className="mt-3 max-w-xl text-bone/75">{creator.bio}</p>
            <p className="mt-2 font-mono text-xs text-ash">En Infected Hub desde {formatDate(creator.joinedAt)}</p>
          </div>
        </div>
        <dl className="relative mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-[3px] border border-concrete bg-concrete">
          {[
            { label: "Mods", value: String(mods.length) },
            { label: "Descargas", value: formatCount(downloads) },
            { label: "Valoración", value: average ? average.toFixed(1) : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-asphalt p-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">{s.label}</dt>
              <dd className="mt-1 font-display text-3xl font-black md:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="mods-del-creador" className="mt-12">
        <h2 id="mods-del-creador" className="mb-6 font-display text-4xl font-black uppercase">
          Sus mods
        </h2>
        <CreatorModsGrid mods={mods} creator={creator} categories={getCategories()} />
      </section>
    </div>
  );
}
