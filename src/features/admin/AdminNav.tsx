"use client";

import { Flag, FolderTree, LayoutDashboard, Package, ScrollText, Settings, ShieldCheck, Users } from "lucide-react";
import { SideNav } from "@/components/layout/SideNav";

export function AdminNav({ queue, reports }: { queue: number; reports: number }) {
  return (
    <SideNav
      vertical
      label="Administración"
      layoutId="admin-nav-active"
      items={[
        { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
        { href: "/admin/moderacion", label: "Moderación", icon: ShieldCheck, badge: queue ? String(queue) : undefined },
        { href: "/admin/reportes", label: "Reportes", icon: Flag, badge: reports ? String(reports) : undefined },
        { href: "/admin/mods", label: "Mods", icon: Package },
        { href: "/admin/usuarios", label: "Usuarios", icon: Users },
        { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
        { href: "/admin/auditoria", label: "Auditoría", icon: ScrollText },
        { href: "/admin/configuracion", label: "Configuración", icon: Settings },
      ]}
    />
  );
}
