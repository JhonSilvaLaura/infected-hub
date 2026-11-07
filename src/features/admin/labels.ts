import type { AuditAction, ReportReason, ReportStatus, Role, ScanResult, UserStatus } from "@/types/admin";

export const ROLE_LABELS: Record<Role, string> = {
  USER: "Usuario",
  CREATOR: "Creador",
  MODERATOR: "Moderador",
  ADMIN: "Admin",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Activo",
  UNVERIFIED: "Sin verificar",
  SUSPENDED: "Suspendido",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE: "Contenido inapropiado",
  SUSPICIOUS_FILE: "Archivo sospechoso",
  UNAUTHORIZED: "Publicado sin autorización",
  IMPERSONATION: "Suplantación de autoría",
  OFFENSIVE_COMMENT: "Comentario ofensivo",
  LICENSE_BREACH: "Incumplimiento de licencia",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Abierto",
  IN_REVIEW: "En revisión",
  RESOLVED: "Resuelto",
  DISMISSED: "Descartado",
};

export const SCAN_LABELS: Record<ScanResult, string> = {
  CLEAN: "Sin amenazas",
  PENDING: "Analizando",
  FLAGGED: "Amenaza detectada",
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  MOD_APPROVED: "Mod aprobado",
  MOD_REJECTED: "Mod rechazado",
  MOD_SUSPENDED: "Mod suspendido",
  REPORT_RESOLVED: "Reporte resuelto",
  REPORT_DISMISSED: "Reporte descartado",
  USER_ROLE_CHANGED: "Rol cambiado",
  USER_SUSPENDED: "Usuario suspendido",
  CATEGORY_UPDATED: "Categoría editada",
  SETTINGS_UPDATED: "Configuración cambiada",
};

const dateTime = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/** Fixed UTC so server and client render the same string. */
export const formatDateTime = (iso: string) => `${dateTime.format(new Date(iso))} UTC`;
