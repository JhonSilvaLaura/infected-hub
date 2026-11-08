/**
 * Acceso a datos del catálogo.
 * Fase 1: lee datos simulados. Fase 2: estas funciones llamarán a la API REST
 * sin que cambien las páginas ni los componentes que las consumen.
 */
import {
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  MOCK_CREATORS,
  MOCK_MODS,
  mockReviewsFor,
} from "@/mocks/catalog.mock";
import { SLOT_GROUPS } from "@/lib/format";
import type { CategorySlug, CharacterSlot, Mod } from "@/types/mod";

export const USING_MOCK_DATA = true;

const publicMods = () => MOCK_MODS.filter((m) => m.status === "APPROVED");

export const getCategories = () => MOCK_CATEGORIES;
export const getCategory = (slug: string) => MOCK_CATEGORIES.find((c) => c.slug === slug);

export const getCreators = () => MOCK_CREATORS;
export const getCreator = (slug: string) => MOCK_CREATORS.find((c) => c.slug === slug);

export const getCollections = () => MOCK_COLLECTIONS;

export const getMods = () => publicMods();
export const getMod = (slug: string) => publicMods().find((m) => m.slug === slug);
export const getModsBySlugs = (slugs: string[]) =>
  slugs.map((s) => getMod(s)).filter((m): m is Mod => Boolean(m));

export const getFeaturedMods = () => publicMods().filter((m) => m.featured);

export const getRecentMods = (limit = 6) =>
  [...publicMods()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);

export const getRelatedMods = (mod: Mod, limit = 3) =>
  publicMods()
    .filter((m) => m.id !== mod.id && (m.categorySlug === mod.categorySlug || m.creatorSlug === mod.creatorSlug))
    .slice(0, limit);

export const getModsByCreator = (slug: string) => publicMods().filter((m) => m.creatorSlug === slug);

export const countByCategory = (): Record<CategorySlug, number> => {
  const counts = Object.fromEntries(MOCK_CATEGORIES.map((c) => [c.slug, 0])) as Record<CategorySlug, number>;
  for (const m of publicMods()) counts[m.categorySlug] += 1;
  counts.packs = MOCK_COLLECTIONS.length;
  return counts;
};

export const getReviews = (mod: Mod) => mockReviewsFor(mod.id);

/** Downloads of paid mods per replaced character across the whole store, highest first. */
export const getSlotDemand = () => {
  const totals = new Map<CharacterSlot, number>();
  for (const m of publicMods().filter((x) => x.price !== null)) totals.set(m.replaces, (totals.get(m.replaces) ?? 0) + m.downloads);
  return [...totals.entries()].map(([slot, downloads]) => ({ slot, downloads })).sort((a, b) => b.downloads - a.downloads);
};

/** Per survivor: how many mods replace them and the cheapest paid price (free ones flagged apart). */
export const getSurvivorRoster = () =>
  SLOT_GROUPS.map((group) => ({
    label: group.label,
    survivors: group.slots.map((slot) => {
      const mods = publicMods().filter((m) => m.replaces === slot);
      const paid = mods.flatMap((m) => (m.price === null ? [] : [m.price]));
      return { slot, count: mods.length, from: paid.length ? Math.min(...paid) : null, free: mods.some((m) => m.price === null) };
    }),
  }));
