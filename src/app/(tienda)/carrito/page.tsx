import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CartView } from "@/features/store/CartView";
import { getMods } from "@/services/catalog.service";
import { getLibrary } from "@/services/store.service";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
      <PageHeader eyebrow="Antes de pagar" title="Carrito" />
      <CartView mods={getMods()} owned={getLibrary().map((i) => i.mod)} />
    </div>
  );
}
