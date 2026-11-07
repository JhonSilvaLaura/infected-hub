import type { ReactNode } from "react";
import { Check } from "lucide-react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
  /** Text stencilled on the safehouse door panel */
  doorLabel: string;
  perks: string[];
}

/** Two-panel layout for auth screens: the form, and a safehouse door with what the account unlocks. */
export function AuthShell({ eyebrow, title, intro, children, doorLabel, perks }: AuthShellProps) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-8 md:py-16 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
      <div className="mx-auto w-full max-w-md lg:mx-0">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood">{eyebrow}</p>
        <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] tracking-wide md:text-6xl">{title}</h1>
        <div className="mt-4 text-bone/70">{intro}</div>
        <div className="mt-8">{children}</div>
      </div>

      <aside
        aria-label="Qué incluye tu cuenta"
        className="relative hidden overflow-hidden rounded-[4px] border border-concrete bg-soot lg:flex lg:flex-col"
      >
        <div className="hazard h-3 shrink-0 opacity-90" aria-hidden />
        {/* Steel door: rivets + stencil */}
        <div
          aria-hidden
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(180deg, #2a2622 0%, #191714 100%)" }}
        >
          {["left-5 top-5", "right-5 top-5", "left-5 bottom-5", "right-5 bottom-5"].map((pos) => (
            <span key={pos} className={`absolute size-2.5 rounded-full bg-concrete-2 shadow-[inset_0_1px_1px_rgba(255,255,255,.15)] ${pos}`} />
          ))}
          <span className="absolute inset-x-10 top-1/2 h-px bg-asphalt/60" />
          <p className="relative -rotate-2 whitespace-pre-line text-center font-display text-7xl font-black uppercase leading-[0.85] tracking-wide text-blood [text-shadow:0_0_14px_rgba(212,42,60,.35)] xl:text-8xl">
            {doorLabel}
          </p>
          <div className="grain absolute inset-0 opacity-40" />
        </div>
        <ul className="space-y-3 border-t border-concrete p-6">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-sm text-bone/85">
              <Check className="mt-0.5 size-4 shrink-0 text-flare" aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
