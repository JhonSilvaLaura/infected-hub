import { describe, expect, it } from "vitest";
import { MOCK_CREATOR_SUBMISSIONS } from "@/mocks/creator.mock";
import { canDelete, canUnpublish, duplicateAsDraft, filterMyMods, type MyModsQuery } from "./my-mods";

const base: MyModsQuery = { q: "", status: "ALL", category: "ALL", slot: "ALL", sort: "updated" };

describe("filterMyMods", () => {
  it("combines status, character and accent-insensitive search", () => {
    const rows = filterMyMods(MOCK_CREATOR_SUBMISSIONS, { ...base, status: "APPROVED", q: "MECANICA" });
    expect(rows.map((r) => r.id)).toEqual(["mock-002"]);
    expect(filterMyMods(MOCK_CREATOR_SUBMISSIONS, { ...base, slot: "coach" }).every((r) => r.replaces === "coach")).toBe(true);
  });

  it("sorts by sales and by most recent update", () => {
    const bySales = filterMyMods(MOCK_CREATOR_SUBMISSIONS, { ...base, sort: "sales" });
    expect(bySales[0].sales).toBeGreaterThanOrEqual(bySales[1].sales);
    const byDate = filterMyMods(MOCK_CREATOR_SUBMISSIONS, base);
    expect(byDate[0].updatedAt >= byDate[1].updatedAt).toBe(true);
  });
});

describe("duplicateAsDraft", () => {
  const source = MOCK_CREATOR_SUBMISSIONS.find((s) => s.id === "mock-001")!;

  it("copies content but resets state, stats and history", () => {
    const copy = duplicateAsDraft(source, MOCK_CREATOR_SUBMISSIONS, "2026-11-06");
    expect(copy).toMatchObject({ status: "DRAFT", slug: undefined, sales: 0, downloads: 0, title: "Bombero Voluntario (copia)" });
    expect(copy.replaces).toBe(source.replaces);
    expect(copy.moderationHistory).toEqual([]);
  });

  it("never reuses an id", () => {
    const first = duplicateAsDraft(source, MOCK_CREATOR_SUBMISSIONS, "2026-11-06");
    const second = duplicateAsDraft(source, [...MOCK_CREATOR_SUBMISSIONS, first], "2026-11-06");
    expect(second.id).not.toBe(first.id);
    expect(second.title).toBe("Bombero Voluntario (copia 2)");
  });
});

describe("row actions", () => {
  it("only drafts can be deleted and only public mods unpublished", () => {
    const byStatus = (st: string) => MOCK_CREATOR_SUBMISSIONS.find((s) => s.status === st)!;
    expect(canDelete(byStatus("DRAFT"))).toBe(true);
    expect(canDelete(byStatus("APPROVED"))).toBe(false);
    expect(canUnpublish(byStatus("APPROVED"))).toBe(true);
    expect(canUnpublish(byStatus("PENDING_REVIEW"))).toBe(false);
  });
});
