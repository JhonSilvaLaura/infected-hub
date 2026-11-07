/**
 * ⚠️ DATOS SIMULADOS (MOCK) — Panel de administración, Fase 1.
 * Usuarios, reportes, cola de moderación y registro de auditoría ficticios.
 * Los correos usan el dominio reservado `.test`. Acceder solo vía `src/services/admin.service.ts`.
 */
import { MOCK_CREATORS } from "@/mocks/catalog.mock";
import type { AdminUser, AuditEntry, PlatformSettings, QueueItem, Report, Role, UserStatus } from "@/types/admin";

const HANDLES = [
  "pala_y_linterna", "medkit_ajeno", "sin_balas", "la_ultima_ronda", "puerta_tapiada", "bengala_roja",
  "grava_fria", "tanque_lento", "techo_seguro", "radio_muda", "bidon_vacio", "cinta_naranja",
  "faro_norte", "sotano_tres", "llave_inglesa", "nube_de_bilis", "ultimo_tren", "barricada",
  "mapa_mojado", "senal_debil", "botiquin_lleno", "cuerda_floja", "tejado_azul", "ronda_extra",
  "guante_roto", "rueda_pinchada", "humo_blanco", "pila_gastada",
];

function day(offset: number) {
  return new Date(Date.UTC(2026, 10, 6 - offset)).toISOString().slice(0, 10);
}

const staff: AdminUser[] = [
  { id: "u-001", username: "guardia_mayor", email: "admin@infectedhub.test", role: "ADMIN", status: "ACTIVE", joinedAt: "2023-05-01", lastSeenAt: day(0), modsPublished: 0, reportsReceived: 0 },
  { id: "u-002", username: "vigia_turno_a", email: "mod.a@infectedhub.test", role: "MODERATOR", status: "ACTIVE", joinedAt: "2024-01-12", lastSeenAt: day(0), modsPublished: 0, reportsReceived: 0 },
  { id: "u-003", username: "vigia_turno_b", email: "mod.b@infectedhub.test", role: "MODERATOR", status: "ACTIVE", joinedAt: "2024-08-30", lastSeenAt: day(2), modsPublished: 0, reportsReceived: 0 },
];

const creators: AdminUser[] = MOCK_CREATORS.map((c, i) => ({
  id: `u-1${String(i).padStart(2, "0")}`,
  username: c.name,
  email: `${c.slug}@ejemplo.test`,
  role: "CREATOR" as Role,
  status: "ACTIVE" as UserStatus,
  joinedAt: c.joinedAt,
  lastSeenAt: day(i),
  modsPublished: [7, 3, 5, 2, 2][i] ?? 1,
  reportsReceived: c.slug === "ferro-vieja" ? 1 : 0,
}));

const players: AdminUser[] = HANDLES.map((handle, i) => ({
  id: `u-2${String(i).padStart(2, "0")}`,
  username: handle,
  email: `${handle}@ejemplo.test`,
  role: "USER",
  status: i % 11 === 4 ? "SUSPENDED" : i % 7 === 3 ? "UNVERIFIED" : "ACTIVE",
  joinedAt: day(20 + i * 23),
  lastSeenAt: day((i * 5) % 40),
  modsPublished: 0,
  reportsReceived: i % 11 === 4 ? 3 : 0,
}));

export const MOCK_USERS: AdminUser[] = [...staff, ...creators, ...players];

export const MOCK_QUEUE: QueueItem[] = [
  {
    id: "q-01",
    title: "Socorrista de Piscina",
    creator: "FerroVieja",
    categorySlug: "survivors",
    kind: "NEW",
    version: "1.0.0",
    submittedAt: "2026-11-03T18:20:00Z",
    fileName: "socorrista_piscina_francis.vpk",
    fileSizeMb: 58,
    scan: "CLEAN",
    license: "Comercial del creador",
    summary: "Sudadera de salvavidas, silbato y gafas de sol. Reemplaza a Francis.",
  },
  {
    id: "q-02",
    title: "Jinete de Feria",
    creator: "HuesoYMalla",
    categorySlug: "special-infected",
    kind: "NEW",
    version: "1.0.0",
    submittedAt: "2026-11-04T09:05:00Z",
    fileName: "jinete_feria_jockey.zip",
    fileSizeMb: 31,
    scan: "PENDING",
    license: "Redistribución con crédito",
    credits: "Textura del traje de feria hecha por Costura, con permiso (mensaje del 12/10).",
    summary: "Disfraz de payaso de feria desteñido. Reemplaza al Jockey.",
  },
  {
    id: "q-03",
    title: "Tanque de Obra",
    creator: "HuesoYMalla",
    categorySlug: "special-infected",
    kind: "UPDATE",
    version: "3.1.0",
    submittedAt: "2026-11-05T21:40:00Z",
    fileName: "tanque_obra_3.1.0.vpk",
    fileSizeMb: 60,
    scan: "CLEAN",
    license: "Comercial del creador",
    summary: "El infectado más grande con casco de obra.",
    releaseNotes: "Nueva variante sin casco y mejor peso de huesos en los hombros.",
  },
  {
    id: "q-04",
    title: "Escupidora de Pantano",
    creator: "MultitudAnónima",
    categorySlug: "special-infected",
    kind: "NEW",
    version: "0.9.0",
    submittedAt: "2026-11-06T07:12:00Z",
    fileName: "escupidora_pantano.zip",
    fileSizeMb: 44,
    scan: "FLAGGED",
    license: "Uso personal",
    summary: "Vestido de pescadora con algas. Reemplaza a la Spitter.",
  },
];

export const MOCK_REPORTS: Report[] = [
  { id: "r-01", targetType: "MOD", targetTitle: "Profesora de Química", reason: "LICENSE_BREACH", details: "El modelo de la cabeza es de otro autor que no permite redistribución.", reporter: "sin_balas", createdAt: "2026-11-05T14:10:00Z", status: "IN_REVIEW" },
  { id: "r-02", targetType: "COMMENT", targetTitle: "Comentario en Bombero Voluntario", modSlug: "bombero-voluntario", reason: "OFFENSIVE_COMMENT", details: "Insultos a otro usuario.", reporter: "medkit_ajeno", createdAt: "2026-11-06T08:30:00Z", status: "OPEN" },
  { id: "r-03", targetType: "MOD", targetTitle: "Turno de Noche", modSlug: "turno-de-noche", reason: "SUSPICIOUS_FILE", details: "El antivirus de mi equipo marcó el archivo.", reporter: "puerta_tapiada", createdAt: "2026-11-04T19:55:00Z", status: "OPEN" },
  { id: "r-04", targetType: "MOD", targetTitle: "Chaqueta de Cuero", modSlug: "chaqueta-de-cuero", reason: "IMPERSONATION", details: "Dice ser el autor original pero el mod es de otra persona.", reporter: "faro_norte", createdAt: "2026-11-03T11:00:00Z", status: "OPEN" },
  { id: "r-05", targetType: "COMMENT", targetTitle: "Comentario en Tanque de Obra", modSlug: "tanque-de-obra", reason: "INAPPROPRIATE", details: "Enlace a una web externa sospechosa.", reporter: "techo_seguro", createdAt: "2026-11-02T22:15:00Z", status: "OPEN" },
  { id: "r-06", targetType: "MOD", targetTitle: "Novia del Pantano", modSlug: "novia-del-pantano", reason: "UNAUTHORIZED", details: "Usa el velo de otro mod de Witch.", reporter: "grava_fria", createdAt: "2026-10-30T10:00:00Z", status: "DISMISSED" },
  { id: "r-07", targetType: "COMMENT", targetTitle: "Comentario en Guantes Tácticos", modSlug: "guantes-tacticos", reason: "OFFENSIVE_COMMENT", details: "Spam repetido.", reporter: "radio_muda", createdAt: "2026-10-28T16:40:00Z", status: "RESOLVED" },
];

const AUDIT_SEED: Omit<AuditEntry, "id" | "at">[] = [
  { actor: "vigia_turno_a", actorRole: "MODERATOR", action: "MOD_APPROVED", target: "Cirujana de Campaña", detail: "v1.0.0" },
  { actor: "vigia_turno_b", actorRole: "MODERATOR", action: "REPORT_DISMISSED", target: "Reporte r-06", detail: "Velo modelado por el creador, con archivos fuente adjuntos." },
  { actor: "guardia_mayor", actorRole: "ADMIN", action: "USER_ROLE_CHANGED", target: "Brecha", detail: "USER → CREATOR" },
  { actor: "vigia_turno_a", actorRole: "MODERATOR", action: "MOD_REJECTED", target: "Soldado de Asalto", detail: "Modelo extraído de otro juego." },
  { actor: "vigia_turno_a", actorRole: "MODERATOR", action: "MOD_SUSPENDED", target: "Profesora de Química", detail: "Reporte de licencia en revisión." },
  { actor: "guardia_mayor", actorRole: "ADMIN", action: "SETTINGS_UPDATED", target: "Tamaño máximo de archivo", detail: "512 MB → 1024 MB" },
  { actor: "vigia_turno_b", actorRole: "MODERATOR", action: "REPORT_RESOLVED", target: "Reporte r-07", detail: "Comentario eliminado." },
  { actor: "guardia_mayor", actorRole: "ADMIN", action: "USER_SUSPENDED", target: "barricada", detail: "Spam reiterado. 30 días." },
  { actor: "guardia_mayor", actorRole: "ADMIN", action: "CATEGORY_UPDATED", target: "Infectados especiales", detail: "Descripción actualizada." },
  { actor: "vigia_turno_a", actorRole: "MODERATOR", action: "MOD_APPROVED", target: "Minero Desbocado", detail: "v1.0.0" },
];

export const MOCK_AUDIT: AuditEntry[] = Array.from({ length: 34 }, (_, i) => {
  const seed = AUDIT_SEED[i % AUDIT_SEED.length];
  const at = new Date(Date.UTC(2026, 10, 6, 21, 0) - i * 7.3 * 3600 * 1000);
  return { ...seed, id: `log-${String(34 - i).padStart(4, "0")}`, at: at.toISOString() };
});

export const MOCK_SETTINGS: PlatformSettings = {
  registrationOpen: true,
  requireEmailVerification: true,
  commentsEnabled: true,
  maxModFileMb: 1024,
  maxImagesPerMod: 8,
  maintenanceMessage: "",
};
