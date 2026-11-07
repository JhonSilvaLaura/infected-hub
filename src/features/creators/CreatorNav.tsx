"use client";

import { BarChart3, LayoutDashboard, MessageSquareText, Package, Plus, Receipt, Settings, UserRound } from "lucide-react";
import { SideNav } from "@/components/layout/SideNav";

export function CreatorNav({ unanswered }: { unanswered: number }) {
  return (
    <SideNav
      vertical
      label="Panel del creador"
      layoutId="creator-nav-active"
      items={[
        { href: "/creador", label: "Resumen", icon: LayoutDashboard, exact: true },
        { href: "/creador/mods", label: "Mis mods", icon: Package },
        { href: "/creador/mods/nuevo", label: "Nuevo mod", icon: Plus, exact: true },
        { href: "/creador/ventas", label: "Ventas", icon: Receipt },
        { href: "/creador/resenas", label: "Reseñas", icon: MessageSquareText, badge: unanswered ? String(unanswered) : undefined },
        { href: "/creador/estadisticas", label: "Estadísticas", icon: BarChart3 },
        { href: "/creador/perfil", label: "Perfil", icon: UserRound },
        { href: "/creador/ajustes", label: "Ajustes", icon: Settings },
      ]}
    />
  );
}
