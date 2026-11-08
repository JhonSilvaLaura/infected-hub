import { Hand, Layers, Shirt, UserRound, type LucideIcon } from "lucide-react";
import type { CategorySlug } from "@/types/mod";

export const CATEGORY_ICONS: Record<CategorySlug, LucideIcon> = {
  survivors: UserRound,
  outfits: Shirt,
  arms: Hand,
  packs: Layers,
};
