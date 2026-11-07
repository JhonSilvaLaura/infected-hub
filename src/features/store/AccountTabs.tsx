"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/cuenta/biblioteca", label: "Biblioteca" },
  { href: "/cuenta/deseos", label: "Lista de deseos" },
  { href: "/cuenta/ajustes", label: "Ajustes" },
];

export function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mi cuenta" className="mb-8 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-concrete [scrollbar-width:none]">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              active ? "border-blood text-bone" : "border-transparent text-ash hover:text-bone",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
