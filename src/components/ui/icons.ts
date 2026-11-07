import { Biohazard, Hand, Layers, Shirt, Skull, UserRound, type LucideIcon } from "lucide-react";
import type { CategorySlug } from "@/types/mod";

export const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  survivors: UserRound,
  outfits: Shirt,
  "special-infected": Biohazard,
  "common-infected": Skull,
  arms: Hand,
  packs: Layers,
};
