import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { ModWizard } from "@/features/creators/ModWizard";
import { getCategories } from "@/services/catalog.service";
import { getCurrentCreator } from "@/services/creator.service";

export const metadata: Metadata = { title: "Nuevo mod" };

export default function NewModPage() {
  return (
    <div className="max-w-4xl">
      <DashboardTitle
        eyebrow="Cinco pasos"
        title="Nuevo mod"
        description="Puedes guardar un borrador con solo el título. Para enviarlo a revisión hace falta todo, el archivo y al menos una captura."
      />
      <ModWizard categories={getCategories()} creator={getCurrentCreator()} />
    </div>
  );
}
