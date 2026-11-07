"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SideNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path instead of the path prefix */
  exact?: boolean;
  badge?: string;
}

/** Section navigation for dashboards: horizontal scroll on mobile, vertical list from `lg` (or always, with `vertical`). */
export function SideNav({
  items,
  label,
  layoutId,
  vertical = false,
}: {
  items: SideNavItem[];
  label: string;
  layoutId: string;
  /** Always stack vertically (e.g. inside a drawer) */
  vertical?: boolean;
}) {
  const pathname = usePathname();
  // The longest matching href wins, so "/admin/mods" doesn't also light up "/admin"
  const active = items
    .filter((i) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={label}>
      <ul className={cn("flex gap-1", vertical ? "flex-col" : "overflow-x-auto lg:flex-col")}>
        {items.map(({ href, label: text, icon: Icon, badge }) => {
          const isActive = href === active;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-[3px] px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "text-bone" : "text-ash hover:bg-soot hover:text-bone",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 rounded-[3px] border border-concrete bg-soot"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon className={cn("relative size-4", isActive && "text-flare")} aria-hidden />
                <span className="relative flex-1">{text}</span>
                {badge && (
                  <span className="relative rounded-[2px] bg-blood px-1.5 font-mono text-[10px] font-semibold text-bone">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
