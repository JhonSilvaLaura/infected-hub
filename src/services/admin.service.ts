/**
 * Datos del panel de administración y moderación.
 * Fase 1: datos simulados. Con la API, cada llamada irá autenticada y el backend
 * aplicará RBAC (MODERATOR / ADMIN) y registrará las acciones en audit_logs.
 */
import { MOCK_AUDIT, MOCK_QUEUE, MOCK_REPORTS, MOCK_SETTINGS, MOCK_USERS } from "@/mocks/admin.mock";
import { MOCK_MODS } from "@/mocks/catalog.mock";
import { MOCK_CREATOR_SUBMISSIONS } from "@/mocks/creator.mock";
import { getCategories, countByCategory } from "@/services/catalog.service";
import type { CategorySlug, ModStatus } from "@/types/mod";

export const getUsers = () => MOCK_USERS;
export const getModerationQueue = () => MOCK_QUEUE;
export const getReports = () => MOCK_REPORTS;
export const getAuditLog = () => MOCK_AUDIT;
export const getSettings = () => MOCK_SETTINGS;

export interface AdminModRow {
  id: string;
  slug?: string;
  title: string;
  creator: string;
  categorySlug: CategorySlug;
  status: ModStatus;
  version: string;
  downloads: number;
  updatedAt: string;
}

/** Every mod on the platform regardless of state (public catalog + non-public submissions). */
export function getAllMods(): AdminModRow[] {
  const creatorName = (slug: string) => MOCK_USERS.find((u) => u.email.startsWith(`${slug}@`))?.username ?? slug;
  const publicRows = MOCK_MODS.map((m) => ({
    id: m.id,
    slug: m.slug,
    title: m.title,
    creator: creatorName(m.creatorSlug),
    categorySlug: m.categorySlug,
    status: m.status,
    version: m.version,
    downloads: m.downloads,
    updatedAt: m.updatedAt,
  }));
  const hidden = MOCK_CREATOR_SUBMISSIONS.filter((s) => s.status !== "APPROVED").map((s) => ({
    id: s.id,
    title: s.title,
    creator: "FerroVieja",
    categorySlug: s.categorySlug,
    status: s.status,
    version: s.version,
    downloads: s.downloads,
    updatedAt: s.updatedAt,
  }));
  return [...hidden, ...publicRows];
}

export function getAdminCategories() {
  const counts = countByCategory();
  return getCategories().map((c, i) => ({ ...c, modCount: counts[c.slug], visible: true, order: i + 1 }));
}

export function getPlatformStats() {
  const mods = getAllMods();
  return {
    users: MOCK_USERS.length,
    creators: MOCK_USERS.filter((u) => u.role === "CREATOR").length,
    unverified: MOCK_USERS.filter((u) => u.status === "UNVERIFIED").length,
    published: mods.filter((m) => m.status === "APPROVED").length,
    queue: MOCK_QUEUE.length,
    flaggedFiles: MOCK_QUEUE.filter((q) => q.scan === "FLAGGED").length,
    openReports: MOCK_REPORTS.filter((r) => r.status === "OPEN" || r.status === "IN_REVIEW").length,
    totalDownloads: MOCK_MODS.reduce((n, m) => n + m.downloads, 0),
  };
}
