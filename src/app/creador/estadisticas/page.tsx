import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { StatsView } from "@/features/creators/StatsView";
import { getSlotDemand } from "@/services/catalog.service";
import { getMyDaily, getMySales, getMySubmissions } from "@/services/creator.service";

export const metadata: Metadata = { title: "Estadísticas" };

export default function StatsPage() {
  const published = getMySubmissions().filter((s) => s.status === "APPROVED");
  return (
    <div>
      <DashboardTitle eyebrow="Rendimiento" title="Estadísticas" description="Qué funciona, qué no y qué personajes te faltan." />
      <StatsView
        daily={getMyDaily()}
        sales={getMySales()}
        mods={published.map((s) => ({ id: s.id, title: s.title, downloads: s.downloads }))}
        demand={getSlotDemand()}
        covered={[...new Set(published.map((s) => s.replaces))]}
      />
    </div>
  );
}
