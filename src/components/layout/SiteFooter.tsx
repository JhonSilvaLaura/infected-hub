import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { getCategories } from "@/services/catalog.service";

export function SiteFooter() {
  const categories = getCategories().slice(0, 6);
  return (
    <footer className="mt-24 border-t border-concrete bg-soot">
      <div className="hazard h-1.5 opacity-80" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-ash">
            Mods de personaje para Left 4 Dead 2, revisados antes de publicarse. Hecho por y para la comunidad.
          </p>
        </div>

        <FooterColumn title="Explorar">
          <FooterLink href="/mods">Catálogo completo</FooterLink>
          <FooterLink href="/mods?sort=recent">Recientes</FooterLink>
          <FooterLink href="/mods?sort=rating">Mejor valorados</FooterLink>
          <FooterLink href="/mods?price=free">Gratis</FooterLink>
        </FooterColumn>

        <FooterColumn title="Categorías">
          {categories.map((c) => (
            <FooterLink key={c.slug} href={`/categorias/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Creadores">
          <FooterLink href="/vender">Vende tus mods</FooterLink>
          <FooterLink href="/creadores">Todos los creadores</FooterLink>
          <FooterLink href="/creador">Panel del creador (demo)</FooterLink>
          <FooterLink href="/admin">Administración (demo)</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-concrete">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ash md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            Infected Hub es una plataforma independiente y no oficial. No está afiliada, patrocinada ni aprobada por Valve
            Corporation ni por Steam. Left 4 Dead 2 es una marca de sus respectivos propietarios.
          </p>
          <p className="shrink-0 font-mono">© 2026 INFECTED HUB</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-bone">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ash transition-colors hover:text-flare">
        {children}
      </Link>
    </li>
  );
}
