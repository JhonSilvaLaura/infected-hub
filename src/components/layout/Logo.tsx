import Link from "next/link";
import { cn } from "@/lib/cn";

/** Original mark: a stencil-cut aid cross on a bolted plate. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <path d="M4 2h20l6 6v20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="var(--blood)" />
      <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6Z" fill="var(--asphalt)" />
      <path d="M12 15.2h8M15.2 8v7.2M16.8 16.8V24" stroke="var(--blood)" strokeWidth="1.4" />
      <circle cx="6" cy="6" r="1" fill="var(--asphalt)" />
      <circle cx="6" cy="26" r="1" fill="var(--asphalt)" />
      <circle cx="26" cy="26" r="1" fill="var(--asphalt)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Infected Hub, inicio">
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="flex flex-col leading-none">
        <span className="font-mono text-[10px] tracking-[0.3em] text-ash">MODS L4D2</span>
        <span className="font-display text-2xl font-black tracking-wide text-bone">
          INFECTED<span className="text-blood">HUB</span>
        </span>
      </span>
    </Link>
  );
}
