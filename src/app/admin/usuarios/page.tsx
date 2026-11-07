import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { UsersTable } from "@/features/admin/UsersTable";
import { getUsers } from "@/services/admin.service";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsersPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="Solo ADMIN"
        title="Usuarios"
        description="Cambia roles (incluido dar o quitar el rol de creador o moderador) y suspende cuentas. No puedes cambiar tu propio rol ni dejar la plataforma sin administradores."
      />
      <UsersTable initial={getUsers()} />
    </div>
  );
}
