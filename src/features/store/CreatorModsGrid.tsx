"use client";

import { useState } from "react";
import { ModCard } from "@/components/cards/ModCard";
import { FilterTabs } from "@/components/ui/FilterTabs";
import type { Category, CategorySlug, Creator, Mod } from "@/types/mod";

export function CreatorModsGrid({ mods, creator, categories }: { mods: Mod[]; creator: Creator; categories: Category[] }) {
  const [cat, setCat] = useState<CategorySlug | "ALL">("ALL");
  const used = categories.filter((c) => mods.some((m) => m.categorySlug === c.slug));
  const shown = cat === "ALL" ? mods : mods.filter((m) => m.categorySlug === cat);

  return (
    <div className="space-y-6">
      {used.length > 1 && (
        <FilterTabs
          label="Filtrar por categoría"
          value={cat}
          onChange={setCat}
          options={[
            { value: "ALL" as const, label: "Todos", count: mods.length },
            ...used.map((c) => ({ value: c.slug, label: c.name, count: mods.filter((m) => m.categorySlug === c.slug).length })),
          ]}
        />
      )}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((m) => (
          <li key={m.id}>
            <ModCard mod={m} creator={creator} category={categories.find((c) => c.slug === m.categorySlug)} className="h-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
