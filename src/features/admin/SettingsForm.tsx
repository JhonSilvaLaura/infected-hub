"use client";

import { Lock } from "lucide-react";
import { useId, useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { TextField } from "@/components/forms/TextField";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import type { PlatformSettings } from "@/types/admin";

type ToggleKey = "registrationOpen" | "requireEmailVerification" | "commentsEnabled";

const TOGGLES: { key: ToggleKey; label: string; description: string }[] = [
  { key: "registrationOpen", label: "Registro abierto", description: "Permite crear cuentas nuevas. Las existentes no se ven afectadas." },
  { key: "requireEmailVerification", label: "Verificar correo", description: "Exige confirmar el correo antes de comentar, valorar o publicar." },
  { key: "commentsEnabled", label: "Comentarios", description: "Desactívalo temporalmente ante una ola de spam." },
];

/** Settings that this phase keeps fixed on purpose; shown so admins know they exist. */
const LOCKED = [
  { label: "Moderación obligatoria", value: "Activada", reason: "Ningún mod se publica sin revisión. No se puede desactivar." },
  { label: "Ventas y pagos", value: "Desactivados", reason: "Bloqueado hasta verificar políticas de Valve, licencias y requisitos legales." },
];

export function SettingsForm({ initial }: { initial: PlatformSettings }) {
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<{ maxModFileMb?: string; maxImagesPerMod?: string }>({});
  const [notice, setNotice] = useState<string | null>(null);
  const ids = useId();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  function save() {
    const next = {
      maxModFileMb: values.maxModFileMb >= 10 && values.maxModFileMb <= 2048 ? undefined : "Entre 10 y 2048 MB.",
      maxImagesPerMod: values.maxImagesPerMod >= 1 && values.maxImagesPerMod <= 20 ? undefined : "Entre 1 y 20 imágenes.",
    };
    setErrors(next);
    if (next.maxModFileMb || next.maxImagesPerMod) return;
    const changed = (Object.keys(values) as (keyof PlatformSettings)[]).filter((k) => values[k] !== saved[k]).length;
    setSaved(values);
    setNotice(`${changed} ${changed === 1 ? "ajuste guardado" : "ajustes guardados"} (solo en esta demo). Con la API quedaría en el registro de auditoría.`);
  }

  return (
    <form
      method="post"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6"
    >
      <section className="rounded-[4px] border border-concrete bg-soot">
        <h2 className="border-b border-concrete px-5 py-3 font-semibold">Comunidad</h2>
        <ul className="divide-y divide-concrete">
          {TOGGLES.map((t) => (
            <li key={t.key} className="flex items-center justify-between gap-6 px-5 py-4">
              <div>
                <p className="font-medium">{t.label}</p>
                <p id={`${ids}-${t.key}`} className="text-sm text-ash">
                  {t.description}
                </p>
              </div>
              <Switch
                label={t.label}
                describedBy={`${ids}-${t.key}`}
                checked={values[t.key]}
                onChange={(v) => setValues({ ...values, [t.key]: v })}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[4px] border border-concrete bg-soot p-5">
        <h2 className="mb-4 font-semibold">Archivos</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Tamaño máximo por mod (MB)"
            type="number"
            inputMode="numeric"
            min={10}
            max={2048}
            value={String(values.maxModFileMb)}
            onChange={(e) => setValues({ ...values, maxModFileMb: Number(e.target.value) })}
            error={errors.maxModFileMb}
          />
          <TextField
            label="Capturas máximas por mod"
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={String(values.maxImagesPerMod)}
            onChange={(e) => setValues({ ...values, maxImagesPerMod: Number(e.target.value) })}
            error={errors.maxImagesPerMod}
          />
        </div>
        <p className="mt-3 text-xs text-ash">Extensiones permitidas: .vpk y .zip. Todo archivo pasa por análisis antivirus antes de la revisión.</p>
      </section>

      <section className="rounded-[4px] border border-concrete bg-soot p-5">
        <h2 className="mb-4 font-semibold">Aviso de mantenimiento</h2>
        <TextAreaField
          label="Mensaje en la parte superior del sitio"
          rows={2}
          max={160}
          hint="Déjalo vacío para no mostrar ningún aviso."
          value={values.maintenanceMessage}
          onChange={(e) => setValues({ ...values, maintenanceMessage: e.target.value })}
        />
      </section>

      <section className="rounded-[4px] border border-dashed border-concrete-2 p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <Lock className="size-4 text-ash" aria-hidden />
          Fijado en esta fase
        </h2>
        <dl className="space-y-3">
          {LOCKED.map((l) => (
            <div key={l.label} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <dt className="font-medium">
                {l.label}
                <span className="block text-xs font-normal text-ash">{l.reason}</span>
              </dt>
              <dd className="font-mono text-xs uppercase tracking-wider text-bone/80">{l.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <FormNotice message={notice} />

      <div className="sticky bottom-0 z-20 -mx-4 flex items-center justify-end gap-3 border-t border-concrete bg-asphalt/95 px-4 py-4 backdrop-blur-md md:mx-0">
        {dirty && <span className="mr-auto text-xs text-flare">Cambios sin guardar</span>}
        <Button type="button" variant="ghost" disabled={!dirty} onClick={() => setValues(saved)}>
          Descartar
        </Button>
        <Button type="submit" disabled={!dirty}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
