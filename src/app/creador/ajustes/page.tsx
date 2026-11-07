import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { CreatorSettingsForm } from "@/features/creators/CreatorSettingsForm";

export const metadata: Metadata = { title: "Ajustes" };

export default function CreatorSettingsPage() {
  return (
    <div>
      <DashboardTitle eyebrow="Tu cuenta de creador" title="Ajustes" />
      <CreatorSettingsForm />
    </div>
  );
}
