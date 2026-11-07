import type { CharacterPart, CharacterSlot } from "@/types/mod";

interface SlotItem {
  id: string;
  replaces: CharacterSlot;
  includes: CharacterPart[];
}

/**
 * Two mods clash when they replace the same character and overwrite at least one
 * shared part (a full model and an arms-only mod for the same survivor both touch the arms).
 * Returns one group per clashing character, each with every mod involved.
 */
export function findConflicts<T extends SlotItem>(items: T[]): { slot: CharacterSlot; items: T[] }[] {
  const bySlot = new Map<CharacterSlot, T[]>();
  for (const item of items) bySlot.set(item.replaces, [...(bySlot.get(item.replaces) ?? []), item]);

  const groups: { slot: CharacterSlot; items: T[] }[] = [];
  for (const [slot, list] of bySlot) {
    const clashing = list.filter((a) =>
      list.some((b) => b.id !== a.id && a.includes.some((part) => b.includes.includes(part))),
    );
    if (clashing.length > 1) groups.push({ slot, items: clashing });
  }
  return groups;
}

export function cartTotals(items: { price: number | null }[]) {
  const priced = items.filter((i): i is { price: number } => i.price !== null);
  return { count: priced.length, total: priced.reduce((n, i) => n + i.price, 0) };
}
