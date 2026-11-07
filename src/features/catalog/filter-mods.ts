import { SLOT_LABELS } from "@/lib/format";
import type { CategorySlug, CharacterSlot, Mod } from "@/types/mod";

export type PriceFilter = "all" | "free" | "premium";
export type SortKey = "popular" | "recent" | "rating";

export interface CatalogQuery {
  q: string;
  category: CategorySlug | null;
  price: PriceFilter;
  /** Character the mod replaces */
  slot: CharacterSlot | null;
  sort: SortKey;
  page: number;
}

export const PAGE_SIZE = 9;

export const SORT_LABELS: Record<SortKey, string> = {
  popular: "Más descargados",
  recent: "Más recientes",
  rating: "Mejor valorados",
};

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function parseCatalogQuery(params: URLSearchParams, presetCategory?: CategorySlug): CatalogQuery {
  const price = params.get("price");
  const sort = params.get("sort");
  const page = Number(params.get("page"));
  const slot = params.get("slot");
  return {
    q: params.get("q") ?? "",
    category: presetCategory ?? ((params.get("cat") as CategorySlug | null) || null),
    price: price === "free" || price === "premium" ? price : "all",
    slot: slot && slot in SLOT_LABELS ? (slot as CharacterSlot) : null,
    sort: sort === "recent" || sort === "rating" ? sort : "popular",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Search by title, summary, description, tags and character name; then filter, sort and paginate. */
export function filterMods(mods: Mod[], query: CatalogQuery) {
  const needle = normalize(query.q.trim());
  const matches = mods.filter((m) => {
    if (query.category && m.categorySlug !== query.category) return false;
    if (query.price === "free" && m.price !== null) return false;
    if (query.price === "premium" && m.price === null) return false;
    if (query.slot && m.replaces !== query.slot) return false;
    if (!needle) return true;
    return normalize([m.title, m.summary, ...m.description, ...m.tags, SLOT_LABELS[m.replaces]].join(" ")).includes(needle);
  });

  const sorted = [...matches].sort((a, b) => {
    if (query.sort === "recent") return b.publishedAt.localeCompare(a.publishedAt);
    if (query.sort === "rating") return b.rating - a.rating || b.ratingCount - a.ratingCount;
    return b.downloads - a.downloads;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  return {
    total: sorted.length,
    page,
    totalPages,
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}
