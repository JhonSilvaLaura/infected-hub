"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";
import { DemoBanner } from "@/components/ui/DemoBanner";

interface DashboardShellProps {
  /** Section name next to the logo, e.g. "Creador" */
  area: string;
  /** Who is signed in (avatar + name) */
  account: ReactNode;
  /** Shown in the sidebar and in the mobile drawer; should stack vertically */
  nav: ReactNode;
  /** Right side of the top bar */
  actions?: ReactNode;
  demoNotice: ReactNode;
  children: ReactNode;
}

/**
 * Work area for creators and staff: fixed sidebar from `lg`, drawer below it.
 * Deliberately quieter than the store — data first, no hero effects.
 */
export function DashboardShell({ area, account, nav, actions, demoNotice, children }: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  const brand = (
    <Link href="/" className="flex items-center gap-2" aria-label="Infected Hub, ir a la tienda">
      <LogoMark className="size-7" />
      <span className="font-display text-xl font-black tracking-wide">
        INFECTED<span className="text-blood">HUB</span>
      </span>
      <span className="ml-1 rounded-[2px] border border-concrete-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ash">
        {area}
      </span>
    </Link>
  );

  const sidebar = (
    <>
      <div className="border-b border-concrete px-4 py-4">{account}</div>
      <div className="flex-1 overflow-y-auto px-3 py-4">{nav}</div>
      <div className="border-t border-concrete px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-ash hover:text-bone">
          Ver tienda
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-concrete bg-soot lg:flex">
        <div className="flex h-16 items-center border-b border-concrete px-4">{brand}</div>
        {sidebar}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/70 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú del panel"
              className="fixed inset-y-0 left-0 z-[61] flex w-72 flex-col border-r border-concrete bg-soot lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 34, stiffness: 340 }}
              // Close after following any link inside the drawer
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            >
              <div className="flex h-16 items-center justify-between border-b border-concrete px-4">
                {brand}
                <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar menú" className="text-ash hover:text-bone">
                  <X className="size-5" />
                </button>
              </div>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-concrete bg-asphalt/90 px-4 backdrop-blur-md md:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            className="-ml-1 p-1 text-ash hover:text-bone lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="lg:hidden">{brand}</div>
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </header>
        <main id="contenido" className="flex-1 px-4 pb-12 pt-6 md:px-8">
          <div className="mx-auto max-w-6xl">
            <DemoBanner>{demoNotice}</DemoBanner>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
