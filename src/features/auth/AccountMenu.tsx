"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Library, LogIn, LogOut, Repeat2, ShieldHalf, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Popover } from "@/components/ui/Popover";
import { ROLE_INFO, signOut, useDemoRole } from "@/lib/demo-session";
import { cn } from "@/lib/cn";

/** Header account control: "Entrar" when signed out, a menu with the demo role when signed in. */
export function AccountMenu({ active }: { active?: boolean }) {
  const role = useDemoRole();
  const router = useRouter();

  if (!role) {
    return (
      <Link
        href="/acceso"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-[3px] px-2.5 text-sm font-semibold transition-colors hover:bg-soot-2 hover:text-bone",
          active ? "text-flare" : "text-bone/80",
        )}
      >
        <LogIn className="size-5" aria-hidden />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );
  }

  const info = ROLE_INFO[role];
  return (
    <Popover label={`Cuenta: ${info.user} (${info.label})`} trigger={<UserRound className={cn("size-5", active ? "text-flare" : "text-bone/80")} />} panelClassName="w-64">
      <div className="border-b border-concrete px-4 py-3">
        <p className="font-semibold">{info.user}</p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-ash">{info.label} · demo</p>
      </div>
      <ul className="py-1 text-sm">
        <Item href="/cuenta/biblioteca" icon={<Library className="size-4" />}>
          Mi biblioteca
        </Item>
        {role === "creator" && (
          <Item href="/creador" icon={<LayoutDashboard className="size-4" />}>
            Panel del creador
          </Item>
        )}
        {role === "admin" && (
          <Item href="/admin" icon={<ShieldHalf className="size-4" />}>
            Administración
          </Item>
        )}
        <Item href="/acceso" icon={<Repeat2 className="size-4" />}>
          Cambiar de rol
        </Item>
        <li>
          <button
            type="button"
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-bone/85 hover:bg-soot-2 hover:text-bone"
          >
            <LogOut className="size-4 text-ash" aria-hidden />
            Cerrar sesión
          </button>
        </li>
      </ul>
    </Popover>
  );
}

function Item({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2.5 px-4 py-2 text-bone/85 hover:bg-soot-2 hover:text-bone">
        <span className="text-ash">{icon}</span>
        {children}
      </Link>
    </li>
  );
}
