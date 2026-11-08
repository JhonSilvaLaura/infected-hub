import type { Metadata } from "next";
import { ShieldHalf } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminNav } from "@/features/admin/AdminNav";
import { getPlatformStats } from "@/services/admin.service";

export const metadata: Metadata = { title: { default: "Administración", template: "%s · Administración" } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const stats = getPlatformStats();
  return (
    <DashboardShell
      allow={["admin"]}
      area="Admin"
      account={
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[3px] bg-blood-deep">
            <ShieldHalf className="size-5 text-bone" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">guardia_mayor</p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Admin</p>
          </div>
        </div>
      }
      nav={<AdminNav queue={stats.queue} reports={stats.openReports} />}
      demoNotice={
        <>
          Panel con datos ficticios. Las acciones cambian solo esta pestaña y se pierden al recargar. Con la API, el
          servidor exigirá rol MODERATOR o ADMIN en cada endpoint y guardará cada acción en el registro de auditoría.
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
