/**
 * ⚠️ DATOS SIMULADOS (MOCK) — Cuenta del comprador, Fase 1.
 * Biblioteca de un comprador ficticio. Las "compras" son de demostración: nunca hubo
 * un cobro. Acceder solo vía `src/services/store.service.ts`.
 */
import type { LibraryEntry } from "@/types/store";

export const MOCK_BUYER = { username: "pala_y_linterna", email: "pala_y_linterna@ejemplo.test", since: "2025-03-14" };

/** By mod id (see catalog.mock). Two Nick mods share the arms on purpose, to show a conflict. */
export const MOCK_LIBRARY: LibraryEntry[] = [
  { modId: "mock-001", acquiredAt: "2026-06-02", kind: "purchase", installedVersion: "2.0.0" },
  { modId: "mock-006", acquiredAt: "2026-09-25", kind: "free", installedVersion: "1.0.0" },
  { modId: "mock-004", acquiredAt: "2026-08-10", kind: "purchase", installedVersion: "1.0.0" },
  { modId: "mock-009", acquiredAt: "2026-09-01", kind: "purchase", installedVersion: "1.0.0" },
  { modId: "mock-007", acquiredAt: "2026-05-04", kind: "free", installedVersion: "1.0.0" },
  { modId: "mock-003", acquiredAt: "2026-01-11", kind: "purchase", installedVersion: "3.0.2" },
];
