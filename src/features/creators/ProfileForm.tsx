"use client";

import { BadgeCheck, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { FieldError, TextField } from "@/components/forms/TextField";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { FormNotice } from "@/components/forms/FormNotice";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Category, CategorySlug, Creator } from "@/types/mod";
import { validateVideoUrl } from "./publish-validation";

const BIO_MAX = 160;
const LINKS_MAX = 3;

/** Public profile editor with a live preview of /creadores/[slug]. Nothing is saved in the demo. */
export function ProfileForm({ creator, categories }: { creator: Creator; categories: Category[] }) {
  const [name, setName] = useState(creator.name);
  const [bio, setBio] = useState(creator.bio);
  const [specialty, setSpecialty] = useState<CategorySlug>(creator.specialty);
  const [links, setLinks] = useState<string[]>([""]);
  const [errors, setErrors] = useState<{ name?: string; bio?: string; links?: (string | undefined)[] }>({});
  const [notice, setNotice] = useState<string | null>(null);
  const root = useRef<HTMLFormElement>(null);

  function save() {
    const next = {
      name: /^[\p{L}\p{N}_ .-]{3,24}$/u.test(name.trim()) ? undefined : "De 3 a 24 caracteres: letras, números, espacio, punto o guion.",
      bio: bio.trim().length < 10 || bio.length > BIO_MAX ? `Entre 10 y ${BIO_MAX} caracteres.` : undefined,
      links: links.map((l) => validateVideoUrl(l)),
    };
    setErrors(next);
    if (next.name || next.bio || next.links.some(Boolean)) {
      root.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }
    setNotice("Perfil válido. Se publicará cuando exista la API; no se envió nada.");
  }

  const initials = (name.trim() || "??").slice(0, 2).toUpperCase();
  const specialtyName = categories.find((c) => c.slug === specialty)?.name;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      <form
        ref={root}
        method="post"
        noValidate
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <section className="space-y-5 rounded-[4px] border border-concrete bg-soot p-5">
          <TextField label="Nombre visible" name="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <TextAreaField label="Bio" name="bio" rows={3} max={BIO_MAX} value={bio} onChange={(e) => setBio(e.target.value)} error={errors.bio} />
          <div>
            <label htmlFor="specialty" className="mb-1.5 block text-sm font-medium">
              Especialidad
            </label>
            <select
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as CategorySlug)}
              className="h-12 w-full rounded-[3px] border border-concrete-2 bg-asphalt px-3 focus:border-flare focus:outline-none [&>option]:bg-soot"
            >
              {categories
                .filter((c) => c.slug !== "packs")
                .map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Enlaces (portafolio, redes)</legend>
            <ul className="space-y-2">
              {links.map((l, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      inputMode="url"
                      aria-label={`Enlace ${i + 1}`}
                      placeholder="https://"
                      value={l}
                      aria-invalid={Boolean(errors.links?.[i])}
                      onChange={(e) => setLinks(links.map((x, j) => (j === i ? e.target.value : x)))}
                      className={cn(
                        "h-11 w-full rounded-[3px] border bg-asphalt px-3 text-sm focus:border-flare focus:outline-none",
                        errors.links?.[i] ? "border-blood" : "border-concrete-2",
                      )}
                    />
                    <FieldError message={errors.links?.[i]} />
                  </div>
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLinks(links.filter((_, j) => j !== i))}
                      aria-label={`Quitar enlace ${i + 1}`}
                      className="mt-2.5 text-ash hover:text-bone"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {links.length < LINKS_MAX && (
              <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setLinks([...links, ""])}>
                <Plus className="size-4" aria-hidden />
                Añadir enlace
              </Button>
            )}
          </fieldset>
        </section>
        <FormNotice message={notice} />
        <Button type="submit">Guardar perfil</Button>
      </form>

      <aside aria-label="Vista previa del perfil público" className="xl:sticky xl:top-24 xl:self-start">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Vista previa · /creadores/{creator.slug}</p>
        <div className="rounded-[4px] border border-concrete bg-soot p-5">
          <span className="flex size-16 items-center justify-center rounded-[4px] bg-concrete font-display text-3xl font-black">{initials}</span>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-blood">{specialtyName}</p>
          <p className="mt-1 flex items-center gap-2 font-display text-4xl font-black uppercase leading-none">
            {name || "Sin nombre"}
            {creator.verified && <BadgeCheck className="size-6 text-flare" aria-label="Verificado" />}
          </p>
          <p className="mt-3 text-sm text-bone/75">{bio || "Sin bio."}</p>
          {links.some((l) => l.trim()) && (
            <ul className="mt-3 space-y-1 text-xs text-flare">
              {links.filter((l) => l.trim()).map((l) => (
                <li key={l} className="truncate">
                  {l}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
