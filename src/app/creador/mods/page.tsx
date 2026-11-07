import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { ButtonLink } from "@/components/ui/Button";
import { MyModsTable } from "@/features/creators/MyModsTable";
import { getCategories } from "@/services/catalog.service";
import { DEMO_TODAY, getMySubmissions } from "@/services/creator.service";

export const metadata: Metadata = { title: "Mis mods" };

export default function MyModsPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="Todos tus personajes"
        title="Mis mods"
        action={<ButtonLink href="/creador/mods/nuevo">Nuevo mod</ButtonLink>}
      />
      <Suspense>
        <MyModsTable initial={getMySubmissions()} categories={getCategories()} today={DEMO_TODAY} />
      </Suspense>
    </div>
  );
}
