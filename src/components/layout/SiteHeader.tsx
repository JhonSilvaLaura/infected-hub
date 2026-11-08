"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Heart, Menu, Search, ShoppingCart, X, type LucideIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/layout/Logo";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { cartStore, wishlistStore } from "@/features/store/stores";
import { AccountMenu } from "@/features/auth/AccountMenu";

const NAV = [
  { href: "/mods", label: "Catálogo" },
  { href: "/categorias", label: "Categorías" },
  { href: "/#colecciones", label: "Packs" },
  { href: "/creadores", label: "Creadores" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 24));

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    setOpen(false);
    router.push(q ? `/mods?q=${encodeURIComponent(q)}` : "/mods");
  }

  const cart = cartStore.useIds().length;
  const wishlist = wishlistStore.useIds().length;
  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        solid || open ? "border-concrete bg-asphalt/90 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20 md:gap-6 md:px-8">
        <Logo />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative rounded-[3px] px-3 py-2 text-sm font-medium text-bone/75 transition-colors hover:text-bone",
                    isActive(item.href) && "text-bone",
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-blood" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <form role="search" onSubmit={onSearch} className="ml-auto hidden md:block">
          <label className="group flex h-10 w-64 items-center gap-2 rounded-[3px] border border-concrete bg-soot/80 px-3 transition-colors focus-within:border-flare xl:w-80">
            <Search className="size-4 text-ash group-focus-within:text-flare" aria-hidden />
            <span className="sr-only">Buscar mods</span>
            <input
              name="q"
              type="search"
              placeholder="Buscar mods, creadores…"
              className="w-full bg-transparent text-sm text-bone placeholder:text-ash focus:outline-none"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <IconLink href="/cuenta/deseos" icon={Heart} label="Lista de deseos" count={wishlist} active={pathname === "/cuenta/deseos"} />
          <IconLink href="/carrito" icon={ShoppingCart} label="Carrito" count={cart} active={pathname === "/carrito"} />
          <AccountMenu active={pathname === "/acceso" || (pathname.startsWith("/cuenta") && pathname !== "/cuenta/deseos")} />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-[3px] text-bone hover:bg-soot-2 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-concrete lg:hidden"
          >
            <div className="space-y-4 px-4 py-5">
              <form role="search" onSubmit={onSearch} className="md:hidden">
                <label className="flex h-11 items-center gap-2 rounded-[3px] border border-concrete bg-soot px-3 focus-within:border-flare">
                  <Search className="size-4 text-ash" aria-hidden />
                  <span className="sr-only">Buscar mods</span>
                  <input name="q" type="search" placeholder="Buscar mods…" className="w-full bg-transparent text-sm focus:outline-none" />
                </label>
              </form>
              <ul className="grid gap-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-[3px] px-3 py-3 font-display text-2xl font-extrabold uppercase tracking-wide text-bone hover:bg-soot-2"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2 md:hidden">
                <Link href="/acceso" onClick={() => setOpen(false)} className={buttonClass({ variant: "outline" })}>
                  Entrar
                </Link>
                <Link href="/registro" onClick={() => setOpen(false)} className={buttonClass({ variant: "primary" })}>
                  Crear cuenta
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconLink({
  href,
  icon: Icon,
  label,
  count,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label} (${count})` : label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-[3px] transition-colors hover:bg-soot-2 hover:text-bone",
        active ? "text-flare" : "text-bone/80",
      )}
    >
      <Icon className="size-5" aria-hidden />
      {Boolean(count) && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blood px-1 font-mono text-[10px] font-semibold text-bone">
          {count}
        </span>
      )}
    </Link>
  );
}
