import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Info } from "lucide-react";
import { LoginForm } from "@/features/auth/LoginForm";
import { RoleSelect } from "@/features/auth/RoleSelect";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="pb-16">
      <Suspense fallback={<div className="min-h-[min(80svh,760px)]" />}>
        <RoleSelect />
      </Suspense>

      <div className="mx-auto mt-12 grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-2">
        <section aria-labelledby="como-funciona" className="space-y-3 text-sm text-bone/75">
          <h2 id="como-funciona" className="flex items-center gap-2 font-display text-3xl font-black uppercase text-bone">
            <Info className="size-5 text-flare" aria-hidden />
            Cómo funciona la demo
          </h2>
          <p>
            Todavía no hay cuentas reales: elige un rol y entras con un usuario ficticio. El rol se guarda solo en este
            navegador y únicamente cambia lo que ves.
          </p>
          <p>
            Cuando exista el backend, entrarás con correo y contraseña, y el servidor comprobará tu rol en cada petición.
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-semibold text-flare hover:underline">
              Crear cuenta
            </Link>
          </p>
        </section>

        <details className="group rounded-[4px] border border-concrete bg-soot p-5">
          <summary className="cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
            Acceso con correo y contraseña <span className="font-normal text-ash">(próximamente)</span>
          </summary>
          <div className="mt-5">
            <LoginForm />
          </div>
        </details>
      </div>
    </div>
  );
}
