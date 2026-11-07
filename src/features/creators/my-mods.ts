import type { CreatorSubmission } from "@/types/creator";
import type { CategorySlug, CharacterSlot, ModStatus } from "@/types/mod";

export type MyModsSort = "updated" | "sales" | "downloads" | "rating";

export const SORT_LABELS: Record<MyModsSort, string> = {
  updated: "Última actualización",
  sales: "Ventas",
  downloads: "Descargas",
  rating: "Valoración",
};

export interface MyModsQuery {
  q: string;
  status: ModStatus | "ALL";
  category: CategorySlug | "ALL";
  slot: CharacterSlot | "ALL";
  sort: MyModsSort;
}

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function filterMyMods(rows: CreatorSubmission[], query: MyModsQuery) {
  const needle = normalize(query.q.trim());
  return rows
    .filter(
      (s) =>
        (query.status === "ALL" || s.status === query.status) &&
        (query.category === "ALL" || s.categorySlug === query.category) &&
        (query.slot === "ALL" || s.replaces === query.slot) &&
        (!needle || normalize(`${s.title} ${s.summary}`).includes(needle)),
    )
    .sort((a, b) => {
      if (query.sort === "sales") return b.sales - a.sales;
      if (query.sort === "downloads") return b.downloads - a.downloads;
      if (query.sort === "rating") return b.rating - a.rating;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

/** A fresh draft from an existing mod: same content, no stats, no history, unique id and title. */
export function duplicateAsDraft(source: CreatorSubmission, existing: CreatorSubmission[], today: string): CreatorSubmission {
  let n = 1;
  while (existing.some((s) => s.id === `copy-${source.id}-${n}`)) n++;
  const title = `${source.title} (copia${n > 1 ? ` ${n}` : ""})`;
  return {
    ...source,
    id: `copy-${source.id}-${n}`,
    slug: undefined,
    title: title.slice(0, 60),
    status: "DRAFT",
    version: "0.1.0",
    createdAt: today,
    updatedAt: today,
    downloads: 0,
    views30d: 0,
    sales: 0,
    rating: 0,
    ratingCount: 0,
    comments: 0,
    versions: [{ version: "0.1.0", date: today, notes: [`Copia de ${source.title}.`], state: "PREVIOUS" }],
    priceHistory: [],
    moderationHistory: [],
    moderationNote: undefined,
  };
}

/** Which row actions exist for each state. The server enforces the same rules. */
export const canUnpublish = (s: CreatorSubmission) => s.status === "APPROVED";
export const canDelete = (s: CreatorSubmission) => s.status === "DRAFT";
