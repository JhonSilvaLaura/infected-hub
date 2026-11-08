"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Library, LogOut, ShieldHalf, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScenePanel, sceneCtaClass } from "@/components/scene/ScenePanel";
import { ROLE_INFO, safeNext, signIn, signOut, useDemoRole, type DemoRole } from "@/lib/demo-session";
import type { CoverTone } from "@/types/mod";
import { RoleArt } from "./RoleArt";

const ROLES: { role: DemoRole; tone: CoverTone; icon: LucideIcon; code: string; tab: string; perks: string[]; lands: string }[] = [
  {
    role: "buyer",
    tone: "flare",
    icon: Library,
    code: "CMP",
    tab: "Tienda",
    perks: ["Carrito y lista de deseos", "Biblioteca agrupada por personaje", "Aviso si dos mods pisan al mismo personaje"],
    lands: "Tu biblioteca",
  },
  {
    role: "creator",
    tone: "blood",
    icon: Store,
    code: "CRE",
    tab: "Vender mods",
    perks: ["Publica personajes y ponles precio", "Ventas, reseñas y estadísticas", "Versiones y respuesta de moderación"],
    lands: "Tu panel de creador",
  },
  {
    role: "admin",
    tone: "night",
    icon: ShieldHalf,
    code: "ADM",
    tab: "Moderación",
    perks: ["Cola de moderación y antivirus", "Reportes, usuarios y categorías", "Registro de auditoría"],
    lands: "El panel de administración",
  },
];

/**
 * Demo sign-in in the site's scene panel: pick a role, enter. No password, nothing sent.
 * `?rol=` preselects a role and `?next=` returns to the page that asked for it.
 */
export function RoleSelect() {
  const router = useRouter();
  const params = useSearchParams();
  const current = useDemoRole();
  const wanted = params.get("rol");
  const initial = Math.max(0, ROLES.findIndex((r) => r.role === wanted));

  function enter(role: DemoRole) {
    signIn(role);
    router.push(safeNext(params.get("next"), ROLE_INFO[role].home));
  }

  return (
    <>
      <ScenePanel
        titleId="acceso-title"
        selectorLabel="Elegir con qué rol entrar"
        signal="SESIÓN DE DEMOSTRACIÓN"
        minHeight="min-h-[min(80svh,760px)]"
        initial={initial}
        slides={ROLES.map((r) => {
          const info = ROLE_INFO[r.role];
          const isCurrent = current === r.role;
          return {
            key: r.role,
            tone: r.tone,
            tab: r.tab,
            eyebrow: `Entrar como · ${info.user}`,
            title: info.label,
            body: (
              <ul className="space-y-2">
                {r.perks.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-1 size-4 shrink-0 text-flare" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            ),
            cta: (
              <button type="button" onClick={() => enter(r.role)} className={sceneCtaClass}>
                {isCurrent ? "Continuar" : `Entrar como ${info.label.toLowerCase()}`}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ),
            preview: (
              <div>
                <RoleArt tone={r.tone} icon={r.icon} code={r.code} className="chamfer-tr relative aspect-[16/9] border border-bone/40" />
                <p className="mt-3 text-right text-sm font-semibold text-bone">&gt; Entrarás a: {r.lands}</p>
              </div>
            ),
            thumb: <RoleArt tone={r.tone} icon={r.icon} className="absolute inset-0" />,
            thumbLabel: info.label,
          };
        })}
      />

      {current && (
        <p className="mx-auto mt-4 flex max-w-[1600px] flex-wrap items-center gap-3 px-3 text-sm text-ash md:px-6">
          Sesión de demo activa como <strong className="text-bone">{ROLE_INFO[current].label}</strong> ({ROLE_INFO[current].user}).
          <button type="button" onClick={signOut} className="inline-flex items-center gap-1.5 font-semibold text-flare hover:underline">
            <LogOut className="size-4" aria-hidden />
            Cerrar sesión
          </button>
        </p>
      )}
    </>
  );
}
