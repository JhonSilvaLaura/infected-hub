import type { Metadata } from "next";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { countByCategory, getCategories } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Categorías" };

export default function CategoriesPage() {
  const counts = countByCategory();
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <PageHeader eyebrow="Explorar por tipo" title="Categorías">
        Cada mod de personaje pertenece a una categoría. Elige una para ver solo ese tipo.
      </PageHeader>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {getCategories().map((c) => (
          <li key={c.slug} className="min-h-44">
            <CategoryCard category={c} count={counts[c.slug]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
