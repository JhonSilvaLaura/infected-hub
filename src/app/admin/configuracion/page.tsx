import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { SettingsForm } from "@/features/admin/SettingsForm";
import { getSettings } from "@/services/admin.service";

export const metadata: Metadata = { title: "Configuración" };

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <DashboardTitle eyebrow="Solo ADMIN" title="Configuración" />
      <SettingsForm initial={getSettings()} />
    </div>
  );
}
