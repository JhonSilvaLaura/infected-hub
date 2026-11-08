import type { CharacterPart, CharacterSlot } from "@/types/mod";

const compact = new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat("es", { style: "currency", currency: "USD" });
// Dates are stored as UTC calendar days; format them in UTC so no time zone shifts the day
const date = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export const formatCount = (n: number) => compact.format(n);
export const formatPrice = (cents: number | null) => (cents === null ? "Gratis" : currency.format(cents / 100));
export const formatDate = (iso: string) => date.format(new Date(iso));

export const SLOT_LABELS: Record<CharacterSlot, string> = {
  nick: "Nick",
  ellis: "Ellis",
  coach: "Coach",
  rochelle: "Rochelle",
  bill: "Bill",
  zoey: "Zoey",
  louis: "Louis",
  francis: "Francis",
};

/** Survivors grouped by game, the way players look for them. */
export const SLOT_GROUPS: { label: string; slots: CharacterSlot[] }[] = [
  { label: "Grupo de L4D2", slots: ["nick", "ellis", "coach", "rochelle"] },
  { label: "Grupo de L4D1", slots: ["bill", "zoey", "louis", "francis"] },
];

export const PART_LABELS: Record<CharacterPart, string> = {
  model: "Modelo en tercera persona",
  arms: "Brazos en primera persona",
  portrait: "Retrato del HUD",
  voice: "Voces",
};
