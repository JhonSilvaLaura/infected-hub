"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Numbered pagination; collapses long ranges to first, last and neighbours of the current page. */
export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="Paginación" className={cn("flex items-center justify-center gap-2", className)}>
      <PageButton disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Página anterior">
        <ChevronLeft className="size-4" />
      </PageButton>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-ash" aria-hidden>…</span>}
          <PageButton active={p === page} aria-current={p === page ? "page" : undefined} onClick={() => onChange(p)}>
            {p}
          </PageButton>
        </span>
      ))}
      <PageButton disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Página siguiente">
        <ChevronRight className="size-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({ active, className, ...props }: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-[3px] border font-mono text-sm transition-colors disabled:opacity-30",
        active ? "border-flare bg-flare text-asphalt" : "border-concrete text-bone hover:border-concrete-2",
        className,
      )}
      {...props}
    />
  );
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return { page: current, totalPages, items: items.slice((current - 1) * pageSize, current * pageSize) };
}
