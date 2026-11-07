import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { AuditLogTable } from "@/features/admin/AuditLogTable";
import { getAuditLog } from "@/services/admin.service";

export const metadata: Metadata = { title: "Auditoría" };

export default function AuditPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="Solo ADMIN"
        title="Auditoría"
        description="Registro de solo lectura de las acciones de moderadores y administradores. No se puede editar ni borrar desde aquí."
      />
      <AuditLogTable entries={getAuditLog()} />
    </div>
  );
}
