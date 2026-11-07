/**
 * Datos de la cuenta del comprador.
 * Fase 1: un comprador ficticio con sesión simulada. Con la API, `/api/me/library`
 * devolverá solo lo que el servidor confirme como comprado o descargado por el usuario.
 */
import { MOCK_BUYER, MOCK_LIBRARY } from "@/mocks/store.mock";
import { MOCK_MODS } from "@/mocks/catalog.mock";
import type { Mod } from "@/types/mod";
import type { LibraryEntry } from "@/types/store";

export interface LibraryItem extends LibraryEntry {
  mod: Mod;
  updateAvailable: boolean;
}

export const getDemoBuyer = () => MOCK_BUYER;

export function getLibrary(): LibraryItem[] {
  return MOCK_LIBRARY.flatMap((entry) => {
    const mod = MOCK_MODS.find((m) => m.id === entry.modId);
    return mod ? [{ ...entry, mod, updateAvailable: mod.version !== entry.installedVersion }] : [];
  });
}

export const ownsMod = (modId: string) => MOCK_LIBRARY.some((e) => e.modId === modId);
