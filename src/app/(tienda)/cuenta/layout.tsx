import type { Metadata } from "next";
import Link from "next/link";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { AccountTabs } from "@/features/store/AccountTabs";
import { formatDate } from "@/lib/format";
import { getDemoBuyer } from "@/services/store.service";

export const metadata: Metadata = { title: { default: "Mi cuenta", template: "%s · Mi cuenta" } };

export default function AccountLayout({ children }: LayoutProps<"/cuenta">) {
  const buyer = getDemoBuyer();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <DemoBanner>
        Sesión simulada de un comprador ficticio. Para el acceso real se usará{" "}
        <Link href="/acceso" className="text-bone underline underline-offset-2">
          Entrar
        </Link>{" "}
        cuando existan cuentas; entonces el servidor confirmará qué compraste.
      </DemoBanner>
      <header className="mb-6 flex items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-[3px] bg-concrete font-display text-2xl font-black">
          {buyer.username.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-4xl font-black uppercase leading-none md:text-5xl">{buyer.username}</h1>
          <p className="mt-1 font-mono text-xs text-ash">Comprador desde {formatDate(buyer.since)}</p>
        </div>
      </header>
      <AccountTabs />
      {children}
    </div>
  );
}
