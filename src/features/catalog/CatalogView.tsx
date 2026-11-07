"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { SearchInput } from "@/components/forms/SearchInput";
import { useEffect, useMemo, useState } from "react";
import { ModCard } from "@/components/cards/ModCard";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { CATEGORY_ICONS } from "@/components/ui/icons";
import { SLOT_GROUPS, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Category, CategorySlug, Creator, Mod } from "@/types/mod";
import { filterMods, parseCatalogQuery, SORT_LABELS, type PriceFilter, type SortKey } from "./filter-mods";

interface CatalogViewProps {
  mods: Mod[];
  categories: Category[];
  creators: Creator[];
  /** When rendered inside /categorias/[slug] the category is fixed by the route. */
  presetCategory?: CategorySlug;
}

const PRICE_LABELS: Record<PriceFilter, string> = { all: "Todos", free: "Gratis", premium: "Premium" };

export function CatalogView({ mods, categories, creators, presetCategory }: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const query = parseCatalogQuery(new URLSearchParams(searchParams.toString()), presetCategory);
  const result = useMemo(() => filterMods(mods, query), [mods, query.q, query.category, query.price, query.slot, query.sort, query.page]); // eslint-disable-line react-hooks/exhaustive-deps
  const [draft, setDraft] = useState(query.q);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const creatorBySlug = useMemo(() => new Map(creators.map((c) => [c.slug, c])), [creators]);
  const categoryBySlug = useMemo(() => new Map(categories.map((c) => [c.slug, c])), [categories]);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "" || value === "all") next.delete(key);
      else next.set(key, value);
    }
    if (!("page" in changes)) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Debounced search-as-you-type
  useEffect(() => {
    if (draft === query.q) return;
    const id = setTimeout(() => update({ q: draft }), 250);
    return () => clearTimeout(id);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = [query.price !== "all", query.slot, !presetCategory && query.category, query.q].filter(Boolean).length;
  const clearAll = () => {
    setDraft("");
    router.replace(pathname, { scroll: false });
  };

  const filters = (
    <div className="space-y-8">
      {!presetCategory && (
        <FilterGroup label="Categoría">
          <ChipButton active={!query.category} onClick={() => update({ cat: null })}>
            Todas
          </ChipButton>
          {categories
            .filter((c) => c.slug !== "packs")
            .map((c) => {
              const Icon = CATEGORY_ICONS[c.slug];
              return (
                <ChipButton key={c.slug} active={query.category === c.slug} onClick={() => update({ cat: c.slug })}>
                  <Icon className="size-3.5" aria-hidden />
                  {c.name}
                </ChipButton>
              );
            })}
        </FilterGroup>
      )}

      <FilterGroup label="Precio">
        {(Object.keys(PRICE_LABELS) as PriceFilter[]).map((p) => (
          <ChipButton key={p} active={query.price === p} onClick={() => update({ price: p })}>
            {PRICE_LABELS[p]}
          </ChipButton>
        ))}
      </FilterGroup>

      <FilterGroup label="Reemplaza a">
        <ChipButton active={!query.slot} onClick={() => update({ slot: null })}>
          Cualquiera
        </ChipButton>
      </FilterGroup>
      {SLOT_GROUPS.map((g) => (
        <FilterGroup key={g.label} label={g.label} className="-mt-5">
          {g.slots.map((slot) => (
            <ChipButton key={slot} active={query.slot === slot} onClick={() => update({ slot })}>
              {SLOT_LABELS[slot]}
            </ChipButton>
          ))}
        </FilterGroup>
      ))}

      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="text-sm font-semibold text-flare underline-offset-4 hover:underline">
          Limpiar filtros ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block" aria-label="Filtros">
        <div className="sticky top-28">{filters}</div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            className="flex-1"
            label="Buscar por nombre o personaje"
            value={draft}
            onChange={setDraft}
          />

          <div className="flex gap-3">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-[3px] border border-concrete bg-soot px-3 text-sm sm:flex-none">
              <span className="text-ash">Ordenar</span>
              <select
                value={query.sort}
                onChange={(e) => update({ sort: e.target.value === "popular" ? null : e.target.value })}
                className="bg-transparent font-semibold text-bone focus:outline-none [&>option]:bg-soot"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen}>
              <SlidersHorizontal className="size-4" aria-hidden />
              Filtros{activeCount > 0 && ` (${activeCount})`}
            </Button>
          </div>
        </div>

        <p className="mb-5 font-mono text-xs uppercase tracking-wider text-ash" aria-live="polite">
          {result.total} {result.total === 1 ? "resultado" : "resultados"}
          {query.q && <> para “{query.q}”</>}
        </p>

        {result.items.length === 0 ? (
          <div className="flex flex-col items-center rounded-[4px] border border-dashed border-concrete-2 px-6 py-20 text-center">
            <SearchX className="mb-4 size-10 text-ash" aria-hidden />
            <p className="font-display text-3xl font-black uppercase">Nada por aquí</p>
            <p className="mt-2 max-w-sm text-sm text-ash">
              Ningún mod coincide con esa búsqueda y estos filtros. Prueba con menos filtros o con otra palabra.
            </p>
            <Button variant="primary" className="mt-6" onClick={clearAll}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {result.items.map((m) => (
                <motion.li
                  key={m.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ModCard
                    mod={m}
                    creator={creatorBySlug.get(m.creatorSlug)}
                    category={categoryBySlug.get(m.categorySlug)}
                    className="h-full"
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        <Pagination
          className="mt-10"
          page={result.page}
          totalPages={result.totalPages}
          onChange={(p) => update({ page: p === 1 ? null : String(p) })}
        />
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/70 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
              className="fixed inset-x-0 bottom-0 z-[61] max-h-[85svh] overflow-y-auto rounded-t-[8px] border-t border-concrete bg-soot p-5 pb-8 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-2xl font-black uppercase">Filtros</p>
                <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros" className="text-ash hover:text-bone">
                  <X className="size-5" />
                </button>
              </div>
              {filters}
              <Button className="mt-8 w-full" onClick={() => setFiltersOpen(false)}>
                Ver {result.total} resultados
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <fieldset className={className}>
      <legend className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ash">{label}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function ChipButton({ active, className, ...props }: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[3px] border px-2.5 text-xs font-medium transition-colors",
        active ? "border-blood bg-blood/15 text-bone" : "border-concrete text-bone/70 hover:border-concrete-2 hover:text-bone",
        className,
      )}
      {...props}
    />
  );
}
