import { describe, expect, it } from "vitest";
import { MOCK_MODS } from "@/mocks/catalog.mock";
import { filterMods, PAGE_SIZE, parseCatalogQuery, type CatalogQuery } from "./filter-mods";

const base: CatalogQuery = { q: "", category: null, price: "all", slot: null, sort: "popular", page: 1 };

describe("parseCatalogQuery", () => {
  it("falls back to safe defaults for invalid values", () => {
    const q = parseCatalogQuery(new URLSearchParams("price=gratis&sort=x&page=-3&slot=gordon"));
    expect(q).toMatchObject({ price: "all", sort: "popular", page: 1, slot: null });
  });

  it("lets the route category override the query string", () => {
    const q = parseCatalogQuery(new URLSearchParams("cat=arms"), "survivors");
    expect(q.category).toBe("survivors");
  });
});

describe("filterMods", () => {
  it("searches title and description ignoring accents and case", () => {
    const { items } = filterMods(MOCK_MODS, { ...base, q: "CIRUJANA DE CAMPAÑA" });
    expect(items.map((m) => m.slug)).toEqual(["cirujana-de-campana"]);
  });

  it("filters by category, price and replaced character together", () => {
    const { items } = filterMods(MOCK_MODS, { ...base, category: "survivors", price: "premium" });
    expect(items.every((m) => m.categorySlug === "survivors" && m.price !== null)).toBe(true);
    expect(items.length).toBeGreaterThan(0);

    const forNick = filterMods(MOCK_MODS, { ...base, slot: "nick" }).items;
    expect(forNick.length).toBeGreaterThan(1);
    expect(forNick.every((m) => m.replaces === "nick")).toBe(true);
  });

  it("finds mods by the name of the character they replace", () => {
    const { items } = filterMods(MOCK_MODS, { ...base, q: "zoey" });
    expect(items.map((m) => m.slug)).toContain("novia-a-la-fuga");
  });

  it("sorts by downloads, date and rating", () => {
    const byDownloads = filterMods(MOCK_MODS, base).items;
    expect(byDownloads[0].downloads).toBeGreaterThanOrEqual(byDownloads[1].downloads);

    const byDate = filterMods(MOCK_MODS, { ...base, sort: "recent" }).items;
    expect(byDate[0].publishedAt >= byDate[1].publishedAt).toBe(true);

    const byRating = filterMods(MOCK_MODS, { ...base, sort: "rating" }).items;
    expect(byRating[0].rating).toBeGreaterThanOrEqual(byRating[1].rating);
  });

  it("paginates and clamps out-of-range pages", () => {
    const first = filterMods(MOCK_MODS, base);
    expect(first.items).toHaveLength(PAGE_SIZE);
    const last = filterMods(MOCK_MODS, { ...base, page: 999 });
    expect(last.page).toBe(first.totalPages);
  });

  it("returns an empty result when nothing matches", () => {
    expect(filterMods(MOCK_MODS, { ...base, q: "zzz-no-existe" }).total).toBe(0);
  });
});
