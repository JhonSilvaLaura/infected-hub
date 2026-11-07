import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { CreatorNav } from "@/features/creators/CreatorNav";
import { CreatorTopbar } from "@/features/creators/CreatorTopbar";
import { getCurrentCreator, getMyActivity, getMyStats } from "@/services/creator.service";

export const metadata: Metadata = { title: { default: "Panel del creador", template: "%s · Panel del creador" } };

export default function CreatorLayout({ children }: LayoutProps<"/creador">) {
  const creator = getCurrentCreator();
  return (
    <DashboardShell
      area="Creador"
      account={
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[3px] bg-concrete font-display text-lg font-black">
            {creator.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate font-semibold">
              {creator.name}
              {creator.verified && <BadgeCheck className="size-4 shrink-0 text-flare" aria-label="Creadora verificada" />}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">Creador</p>
          </div>
        </div>
      }
      nav={<CreatorNav unanswered={getMyStats().unanswered} />}
      actions={<CreatorTopbar activity={getMyActivity()} />}
      demoNotice={
        <>
          Panel de una creadora ficticia con datos simulados; nada se guarda. Con cuentas reales, esta sección exigirá el
          rol CREATOR y el servidor validará que cada mod sea tuyo.
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
