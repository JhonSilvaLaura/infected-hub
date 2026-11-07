"use client";

import { Lock } from "lucide-react";
import { useId, useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

const PREFS = [
  { key: "sale", label: "Nueva venta", description: "Un aviso por venta, o un resumen diario si vendes mucho." },
  { key: "review", label: "Nueva reseña", description: "Para que puedas responder pronto." },
  { key: "moderation", label: "Resultado de moderación", description: "Aprobaciones, rechazos y suspensiones. Recomendado." },
] as const;
type Key = (typeof PREFS)[number]["key"];

export function CreatorSettingsForm() {
  const ids = useId();
  const [prefs, setPrefs] = useState<Record<Key, boolean>>({ sale: true, review: true, moderation: true });
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <form
      method="post"
      noValidate
      className="max-w-3xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setNotice("Preferencias válidas. Se guardarán en tu cuenta cuando exista la API; no se envió nada.");
      }}
    >
      <section className="rounded-[4px] border border-concrete bg-soot">
        <h2 className="border-b border-concrete px-5 py-3 font-semibold">Notificaciones por correo</h2>
        <ul className="divide-y divide-concrete">
          {PREFS.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-6 px-5 py-4">
              <div>
                <p className="font-medium">{p.label}</p>
                <p id={`${ids}-${p.key}`} className="text-sm text-ash">
                  {p.description}
                </p>
              </div>
              <Switch label={p.label} describedBy={`${ids}-${p.key}`} checked={prefs[p.key]} onChange={(v) => setPrefs({ ...prefs, [p.key]: v })} />
            </li>
          ))}
        </ul>
      </section>

      <section className="flex gap-3 rounded-[4px] border border-dashed border-concrete-2 p-5">
        <Lock className="mt-0.5 size-5 shrink-0 text-ash" aria-hidden />
        <div>
          <h2 className="font-semibold">Datos fiscales y de cobro</h2>
          <p className="mt-1 text-sm text-ash">
            Bloqueado hasta habilitar pagos. Cuando llegue el momento, el alta se hará con un proveedor de pagos
            verificado; esta web no te pedirá datos bancarios directamente.
          </p>
        </div>
      </section>

      <FormNotice message={notice} />
      <Button type="submit">Guardar preferencias</Button>
    </form>
  );
}
