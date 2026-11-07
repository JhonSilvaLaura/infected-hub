import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatalogSkeleton } from "@/features/catalog/CatalogSkeleton";
import { CatalogView } from "@/features/catalog/CatalogView";
import { getCategories, getCreators, getMods } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Catálogo" };

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader eyebrow="Todos los mods aprobados" title="Catálogo">
        Busca por nombre o personaje, filtra por categoría, precio o a quién reemplaza, y ordena por lo que más te importe.
      </PageHeader>
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogView mods={getMods()} categories={getCategories()} creators={getCreators()} />
      </Suspense>
    </div>
  );
}
