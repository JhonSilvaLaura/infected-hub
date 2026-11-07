import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { AdminModsTable } from "@/features/admin/AdminModsTable";
import { getAllMods } from "@/services/admin.service";
import { getCategories } from "@/services/catalog.service";

export const metadata: Metadata = { title: "Mods" };

export default function AdminModsPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="Administración"
        title="Mods"
        description="Todos los mods de la plataforma, incluidos los que no son públicos. Suspender oculta el mod del catálogo de inmediato."
      />
      <AdminModsTable initial={getAllMods()} categories={getCategories()} />
    </div>
  );
}
