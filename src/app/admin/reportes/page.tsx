import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { ReportsBoard } from "@/features/admin/ReportsBoard";
import { getReports } from "@/services/admin.service";

export const metadata: Metadata = { title: "Reportes" };

export default function ReportsPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="Moderación"
        title="Reportes"
        description="Toma un caso para que nadie más lo atienda a la vez. Resolver o descartar exige una nota interna."
      />
      <ReportsBoard initial={getReports()} />
    </div>
  );
}
