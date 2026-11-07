import { describe, expect, it } from "vitest";
import { MOCK_AUDIT, MOCK_REPORTS, MOCK_USERS } from "@/mocks/admin.mock";
import { canChangeRole, filterAudit, filterReports, filterUsers, slugify, validateCategory } from "./filters";

describe("filterUsers", () => {
  it("searches username and email ignoring accents", () => {
    const result = filterUsers(MOCK_USERS, { q: "MULTITUDANONIMA", role: "ALL", status: "ALL" });
    expect(result.map((u) => u.username)).toEqual(["MultitudAnónima"]);
  });

  it("combines role and status filters", () => {
    const result = filterUsers(MOCK_USERS, { q: "", role: "USER", status: "SUSPENDED" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((u) => u.role === "USER" && u.status === "SUSPENDED")).toBe(true);
  });
});

describe("filterReports", () => {
  it("'ACTIVE' keeps open and in-review reports, newest first", () => {
    const result = filterReports(MOCK_REPORTS, { status: "ACTIVE" });
    expect(result.every((r) => r.status === "OPEN" || r.status === "IN_REVIEW")).toBe(true);
    expect(result[0].createdAt >= result[result.length - 1].createdAt).toBe(true);
  });
});

describe("filterAudit", () => {
  it("filters by action and free text", () => {
    const result = filterAudit(MOCK_AUDIT, { q: "brecha", action: "USER_ROLE_CHANGED" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((e) => e.action === "USER_ROLE_CHANGED")).toBe(true);
  });
});

describe("canChangeRole", () => {
  const admin = MOCK_USERS.find((u) => u.role === "ADMIN")!;
  const moderator = MOCK_USERS.find((u) => u.role === "MODERATOR")!;
  const player = MOCK_USERS.find((u) => u.role === "USER")!;

  it("only admins can change roles", () => {
    expect(canChangeRole(admin, player, 1)).toBe(true);
    expect(canChangeRole(moderator, player, 1)).toBe(false);
  });

  it("blocks changing your own role and demoting the last admin", () => {
    expect(canChangeRole(admin, admin, 2)).toBe(false);
    const otherAdmin = { ...player, id: "x", role: "ADMIN" as const };
    expect(canChangeRole(admin, otherAdmin, 1)).toBe(false);
    expect(canChangeRole(admin, otherAdmin, 2)).toBe(true);
  });
});

describe("validateCategory", () => {
  const existing = [{ slug: "survivors", name: "Supervivientes", description: "Modelos completos", modCount: 3, visible: true }];

  it("rejects duplicate names except when editing the same category", () => {
    expect(validateCategory({ slug: null, name: "supervivientes", description: "Otra descripción" }, existing).name).toBeDefined();
    expect(validateCategory({ slug: "survivors", name: "Supervivientes", description: "Modelos completos de superviviente" }, existing).name).toBeUndefined();
  });

  it("builds URL-safe slugs", () => {
    expect(slugify("Mods de Física ¡Nuevos!")).toBe("mods-de-fisica-nuevos");
  });
});
