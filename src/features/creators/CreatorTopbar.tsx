"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Plus, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import type { CreatorActivity } from "@/types/creator";
import { formatDate } from "@/lib/format";

export function CreatorTopbar({ activity }: { activity: CreatorActivity[] }) {
  const router = useRouter();
  const [seen, setSeen] = useState(false);

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    router.push(q ? `/creador/mods?q=${encodeURIComponent(q)}` : "/creador/mods");
  }

  return (
    <>
      <form role="search" onSubmit={onSearch} className="hidden md:block">
        <label className="flex h-9 w-60 items-center gap-2 rounded-[3px] border border-concrete bg-soot px-3 focus-within:border-flare">
          <Search className="size-4 text-ash" aria-hidden />
          <span className="sr-only">Buscar en mis mods</span>
          <input name="q" type="search" placeholder="Buscar en mis mods…" className="w-full bg-transparent text-sm focus:outline-none" />
        </label>
      </form>

      <Popover
        label="Notificaciones"
        onOpen={() => setSeen(true)}
        trigger={
          <>
            <Bell className="size-5" aria-hidden />
            {!seen && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-blood" aria-hidden />}
          </>
        }
      >
        <p className="border-b border-concrete px-4 py-3 text-sm font-semibold">Notificaciones</p>
        <ul className="max-h-80 divide-y divide-concrete overflow-y-auto">
          {activity.map((a) => (
            <li key={a.id} className="px-4 py-3 text-sm">
              <p className="text-bone/85">{a.text}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ash">{formatDate(a.date)}</p>
            </li>
          ))}
        </ul>
      </Popover>

      <Link href="/creador/mods/nuevo" className={buttonClass({ variant: "primary", size: "sm" })}>
        <Plus className="size-4" aria-hidden />
        <span className="hidden sm:inline">Nuevo mod</span>
      </Link>
    </>
  );
}
