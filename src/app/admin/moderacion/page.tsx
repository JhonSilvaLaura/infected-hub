import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { ModerationQueue } from "@/features/admin/ModerationQueue";
import { getModerationQueue } from "@/services/admin.service";
import { getCategories } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Moderación" };

export default function ModerationPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="Moderación"
        title="Cola de revisión"
        description="Los envíos solo se pueden aprobar con el análisis antivirus limpio y la revisión completa. Rechazar exige un motivo."
      />
      <ModerationQueue initial={getModerationQueue()} categories={getCategories()} />
    </div>
  );
}
