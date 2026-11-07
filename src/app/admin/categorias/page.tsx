import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { CategoriesEditor } from "@/features/admin/CategoriesEditor";
import { getAdminCategories } from "@/services/admin.service";

export const metadata: Metadata = { title: "Categorías" };

export default function AdminCategoriesPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="Solo ADMIN"
        title="Categorías"
        description="El orden aquí es el orden en el inicio y en el catálogo."
      />
      <CategoriesEditor initial={getAdminCategories()} />
    </div>
  );
}
