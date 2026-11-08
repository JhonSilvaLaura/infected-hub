"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { sceneCtaClass } from "@/components/scene/ScenePanel";
import {
  ROLE_INFO,
  signIn,
  useDemoRole,
  type DemoRole,
} from "@/lib/demo-session";

/**
 * Shows `children` only to the demo roles in `allow`. This is presentation, not security:
 * once the API exists the server rejects requests from the wrong role whatever the UI shows.
 */
export function RoleGate({
  allow,
  children,
}: {
  allow: DemoRole[];
  children: ReactNode;
}) {
  const role = useDemoRole();
  const pathname = usePathname();

  const allowed = Boolean(role && allow.includes(role));
  const target = allow[0];
  const info = ROLE_INFO[target];

  // The page is always rendered (so the route stays prerenderable) and only hidden until
  // the browser knows the role. `contents` keeps the wrapper out of the layout.
  return (
    <>
      <div className={allowed ? "contents" : "hidden"}>{children}</div>
      {role !== undefined && !allowed && (
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <section
            aria-labelledby="gate-title"
            className="chamfer-tr relative w-full max-w-xl overflow-hidden border border-bone/30 bg-soot p-8 md:p-10"
          >
            <div aria-hidden className="scanlines absolute inset-0" />
            <div className="relative">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-blood">
                <Lock className="size-3.5" aria-hidden />
                {role
                  ? `Entraste como ${ROLE_INFO[role].label.toLowerCase()}`
                  : "Sin sesión"}
              </p>
              <h1
                id="gate-title"
                className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] md:text-6xl"
              >
                Zona de {info.label.toLowerCase()}
              </h1>
              <p className="mt-4 text-bone/75">
                Esta sección es para el rol <strong>{info.label}</strong>. En la
                demo puedes entrar con el usuario ficticio{" "}
                <span className="font-mono text-bone">{info.user}</span>, sin
                contraseña.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => signIn(target)}
                  className={sceneCtaClass}
                >
                  Entrar como {info.label.toLowerCase()}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
                <Link
                  href="/"
                  className="text-sm font-semibold text-ash hover:text-bone"
                >
                  Volver a la tienda
                </Link>
                <Link
                  href={`/acceso?rol=${target}&next=${encodeURIComponent(pathname)}`}
                  className="text-sm font-semibold text-ash hover:text-bone"
                >
                  Ver todos los roles
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
