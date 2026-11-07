"use client";

import { useId, useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

const PREFS = [
  { key: "updates", label: "Actualizaciones de mis mods", description: "Aviso cuando un mod de tu biblioteca publica una versión nueva." },
  { key: "wishlist", label: "Bajadas de precio", description: "Aviso cuando un mod de tu lista de deseos cambia de precio." },
  { key: "news", label: "Novedades de creadores que sigues", description: "Un resumen semanal, como mucho." },
] as const;

type PrefKey = (typeof PREFS)[number]["key"];

export function AccountSettingsForm({ username, email }: { username: string; email: string }) {
  const ids = useId();
  const [name, setName] = useState(username);
  const [error, setError] = useState<string>();
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({ updates: true, wishlist: true, news: false });
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <form
      method="post"
      noValidate
      className="max-w-2xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const ok = /^[a-z0-9_]{3,24}$/i.test(name.trim());
        setError(ok ? undefined : "De 3 a 24 caracteres: letras, números o guion bajo.");
        if (!ok) {
          e.currentTarget.querySelector<HTMLInputElement>("[name=displayName]")?.focus();
          return;
        }
        setNotice("Ajustes válidos. Se guardarán en tu cuenta cuando exista el backend; no se envió nada.");
      }}
    >
      <section className="space-y-5 rounded-[4px] border border-concrete bg-soot p-5">
        <h2 className="font-semibold">Perfil</h2>
        <TextField label="Nombre visible" name="displayName" value={name} onChange={(e) => setName(e.target.value)} error={error} />
        <TextField label="Correo" name="email" value={email} readOnly hint="Para cambiarlo tendrás que confirmar el correo nuevo." />
      </section>

      <section className="rounded-[4px] border border-concrete bg-soot">
        <h2 className="border-b border-concrete px-5 py-3 font-semibold">Notificaciones</h2>
        <ul className="divide-y divide-concrete">
          {PREFS.map((p) => (
            <li key={p.key} className="flex items-center justify-between gap-6 px-5 py-4">
              <div>
                <p className="font-medium">{p.label}</p>
                <p id={`${ids}-${p.key}`} className="text-sm text-ash">
                  {p.description}
                </p>
              </div>
              <Switch
                label={p.label}
                describedBy={`${ids}-${p.key}`}
                checked={prefs[p.key]}
                onChange={(v) => setPrefs({ ...prefs, [p.key]: v })}
              />
            </li>
          ))}
        </ul>
      </section>

      <FormNotice message={notice} />
      <Button type="submit">Guardar cambios</Button>
    </form>
  );
}
