import type { AdminUser, AuditAction, AuditEntry, Report, ReportStatus, Role, UserStatus } from "@/types/admin";

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const matches = (needle: string, ...fields: (string | undefined)[]) =>
  !needle || fields.some((f) => f && normalize(f).includes(normalize(needle)));

export function filterUsers(users: AdminUser[], f: { q: string; role: Role | "ALL"; status: UserStatus | "ALL" }) {
  return users.filter(
    (u) =>
      (f.role === "ALL" || u.role === f.role) &&
      (f.status === "ALL" || u.status === f.status) &&
      matches(f.q, u.username, u.email),
  );
}

export function filterReports(reports: Report[], f: { status: ReportStatus | "ACTIVE" | "ALL" }) {
  return reports
    .filter((r) =>
      f.status === "ALL" ? true : f.status === "ACTIVE" ? r.status === "OPEN" || r.status === "IN_REVIEW" : r.status === f.status,
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function filterAudit(entries: AuditEntry[], f: { q: string; action: AuditAction | "ALL" }) {
  return entries.filter((e) => (f.action === "ALL" || e.action === f.action) && matches(f.q, e.actor, e.target, e.detail));
}

/**
 * Role changes an acting user may make. Mirrors the backend rule:
 * moderators cannot change roles; nobody can change their own role or demote the last admin.
 */
export function canChangeRole(actor: { id: string; role: Role }, target: AdminUser, admins: number) {
  if (actor.role !== "ADMIN") return false;
  if (actor.id === target.id) return false;
  if (target.role === "ADMIN" && admins <= 1) return false;
  return true;
}

export interface AdminCategory {
  slug: string;
  name: string;
  description: string;
  modCount: number;
  visible: boolean;
}

/** `slug: null` means a new category. */
export type CategoryDraft = { slug: string | null; name: string; description: string };

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function validateCategory(draft: CategoryDraft, existing: AdminCategory[]) {
  const name = draft.name.trim();
  const duplicate = existing.some((c) => c.slug !== draft.slug && c.name.toLowerCase() === name.toLowerCase());
  return {
    name: name.length < 3 || name.length > 40 ? "Entre 3 y 40 caracteres." : duplicate ? "Ya existe una categoría con ese nombre." : undefined,
    description: draft.description.trim().length < 10 ? "Describe la categoría en al menos 10 caracteres." : undefined,
  };
}
