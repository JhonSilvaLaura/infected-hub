import type { Metadata } from "next";
import { WishlistView } from "@/features/store/WishlistView";
import { getCategories, getCreators, getMods } from "@/services/catalog.service";
import { getLibrary } from "@/services/store.service";

export const metadata: Metadata = { title: "Lista de deseos" };

export default function WishlistPage() {
  return (
    <WishlistView
      mods={getMods()}
      creators={getCreators()}
      categories={getCategories()}
      ownedIds={getLibrary().map((i) => i.mod.id)}
    />
  );
}
