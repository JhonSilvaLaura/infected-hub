import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { SalesView } from "@/features/creators/SalesView";
import { DEMO_TODAY, getMySales, getMySubmissions } from "@/services/creator.service";

export const metadata: Metadata = { title: "Ventas" };

export default function SalesPage() {
  const mods = getMySubmissions()
    .filter((s) => s.price !== null && s.status === "APPROVED")
    .map((s) => ({ id: s.id, title: s.title }));
  return (
    <div>
      <DashboardTitle
        eyebrow="Simuladas"
        title="Ventas"
        description="Transacciones de demostración: nadie pagó nada. Los compradores aparecen anonimizados."
      />
      <SalesView sales={getMySales()} mods={mods} today={DEMO_TODAY} />
    </div>
  );
}
