"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { TextField } from "@/components/forms/TextField";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { hasErrors } from "@/features/auth/validation";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { SubmissionVersion, VersionState } from "@/types/creator";
import { FormSection, ModFileField } from "../publish-fields";
import { bumpPatch, compareSemver, validateNewVersion } from "../publish-validation";

const STATE_META: Record<VersionState, { label: string; className: string }> = {
  LIVE: { label: "Pública", className: "border-bile/50 text-bile" },
  IN_REVIEW: { label: "En revisión", className: "border-flare/50 text-flare" },
  PREVIOUS: { label: "Anterior", className: "border-concrete-2 text-ash" },
  REJECTED: { label: "Rechazada", className: "border-blood/60 text-[#ff5a69]" },
};

interface VersionsTabProps {
  versions: SubmissionVersion[];
  /** Drafts can't take versions until they are published once */
  canUpload: boolean;
  today: string;
  onAdd: (v: SubmissionVersion) => void;
}

export function VersionsTab({ versions, canUpload, today, onAdd }: VersionsTabProps) {
  const latest = [...versions].map((v) => v.version).sort(compareSemver).at(-1) ?? "1.0.0";
  const pendingReview = versions.some((v) => v.state === "IN_REVIEW");
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(bumpPatch(latest));
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ReturnType<typeof validateNewVersion>>({ version: undefined, notes: undefined, file: undefined });

  function submit() {
    const result = validateNewVersion({ version, notes, file }, versions.map((v) => v.version));
    setErrors(result);
    if (hasErrors(result)) return;
    onAdd({ version: version.trim(), date: today, notes: notes.trim().split("\n").filter(Boolean), state: "IN_REVIEW" });
    setOpen(false);
    setNotes("");
    setFile(null);
    setVersion(bumpPatch(version.trim()));
  }

  return (
    <div className="space-y-6">
      {canUpload && !open && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setOpen(true)} disabled={pendingReview}>
            <Upload className="size-4" aria-hidden />
            Subir nueva versión
          </Button>
          {pendingReview && <p className="text-sm text-ash">Ya hay una versión en revisión. Espera a que moderación responda.</p>}
        </div>
      )}

      {open && (
        <form
          method="post"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <FormSection title="Nueva versión" description={`La versión pública sigue siendo la actual hasta que moderación apruebe la nueva. Última: v${latest}.`}>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Número de versión" name="version" value={version} onChange={(e) => setVersion(e.target.value)} error={errors.version} />
            </div>
            <TextAreaField
              label="Novedades"
              name="notes"
              rows={4}
              max={1000}
              hint="Una línea por cambio. Se mostrarán en el historial público."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              error={errors.notes}
            />
            <ModFileField file={file} onChange={setFile} error={errors.file} label="Archivo de la nueva versión" />
            <div className="flex gap-2">
              <Button type="submit">Enviar versión a revisión</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </FormSection>
        </form>
      )}

      <ol className="relative space-y-4 border-l border-concrete pl-6">
        {versions.map((v) => (
          <li key={v.version} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute -left-[29px] top-1.5 size-2.5 rounded-full border-2 border-asphalt",
                v.state === "LIVE" ? "bg-bile" : v.state === "IN_REVIEW" ? "bg-flare" : v.state === "REJECTED" ? "bg-blood" : "bg-concrete-2",
              )}
            />
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono font-semibold">v{v.version}</p>
              <span className={cn("rounded-[2px] border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider", STATE_META[v.state].className)}>
                {STATE_META[v.state].label}
              </span>
              <time dateTime={v.date} className="font-mono text-xs text-ash">
                {formatDate(v.date)}
              </time>
            </div>
            <ul className="mt-1 list-inside list-disc text-sm text-bone/80">
              {v.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
