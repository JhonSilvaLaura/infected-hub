import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-32 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-blood">
            Error 404
          </p>
          <h1 className="mt-4 font-display text-6xl font-black uppercase leading-[0.9] md:text-8xl">
            Esta puerta está tapiada
          </h1>
          <p className="mt-6 max-w-md text-bone/70">
            La página que buscas no existe o el mod fue retirado. Vuelve al
            catálogo para seguir explorando.
          </p>
          <ButtonLink href="/mods" className="mt-8">
            Ir al catálogo
          </ButtonLink>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
