import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteSkeleton } from "@/components/layout/RouteSkeleton";
import { Suspense } from "react";
import { CollectionCard } from "@/components/cards/CollectionCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatalogSkeleton } from "@/features/catalog/CatalogSkeleton";
import { CatalogView } from "@/features/catalog/CatalogView";
import {
  getCategories,
  getCategory,
  getCollections,
  getCreator,
  getCreators,
  getMods,
  getModsBySlugs,
} from "@/services/catalog.service";

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getCategory(slug)?.name ?? "Categoría" };
}

export default function CategoryPage({ params }: PageProps<"/categorias/[slug]">) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      {params.then(({ slug }) => (
        <CategoryContent slug={slug} />
      ))}
    </Suspense>
  );
}

async function CategoryContent({ slug }: { slug: string }) {
  const category = getCategory(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader eyebrow="Categoría" title={category.name}>
        {category.description}
      </PageHeader>

      {category.slug === "packs" ? (
        <ul className="grid gap-5 md:grid-cols-3">
          {getCollections().map((col) => (
            <li key={col.slug}>
              <CollectionCard collection={col} mods={getModsBySlugs(col.modSlugs)} curator={getCreator(col.curatorSlug)} />
            </li>
          ))}
        </ul>
      ) : (
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogView
            mods={getMods()}
            categories={getCategories()}
            creators={getCreators()}
            presetCategory={category.slug}
          />
        </Suspense>
      )}
    </div>
  );
}
