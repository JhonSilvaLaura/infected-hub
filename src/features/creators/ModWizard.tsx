"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleAlert, History, Save, Send } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ModCard } from "@/components/cards/ModCard";
import { FormNotice } from "@/components/forms/FormNotice";
import { TextField } from "@/components/forms/TextField";
import { Button } from "@/components/ui/Button";
import { hasErrors } from "@/features/auth/validation";
import { formatPrice, PART_LABELS, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Category, Creator, Mod } from "@/types/mod";
import {
  CharacterFields,
  focusFirstError,
  FormSection,
  GalleryField,
  InfoFields,
  LicenseFields,
  ModFileField,
  PriceField,
  RightsFields,
  usePublishForm,
  type Preview,
} from "./publish-fields";
import { firstStepWithErrors, stepErrors, validatePublish, WIZARD_STEPS, type PublishValues } from "./publish-validation";

const DRAFT_KEY = "infectedhub:mod-wizard";
const DRAFT_EVENT = `${DRAFT_KEY}:change`;

interface SavedDraft {
  values: PublishValues;
  savedAt: number;
}

function readDraftRaw() {
  try {
    return localStorage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
}

function subscribeDraft(onChange: () => void) {
  window.addEventListener(DRAFT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(DRAFT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeDraft(draft: SavedDraft | null) {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable: autosave just doesn't persist */
  }
  window.dispatchEvent(new Event(DRAFT_EVENT));
}

function parseDraft(raw: string | null): SavedDraft | null {
  try {
    const d = raw ? (JSON.parse(raw) as SavedDraft) : null;
    return d && typeof d.savedAt === "number" && d.values ? d : null;
  } catch {
    return null;
  }
}

/** Wall-clock time for autosave stamps (kept outside render). */
const stamp = () => Date.now();

const ago = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  return m < 60 ? `hace ${m} min` : `hace ${Math.round(m / 60)} h`;
};

interface ModWizardProps {
  categories: Category[];
  creator: Creator;
}

/**
 * Five-step flow to create a mod. Text fields autosave to this browser (files can't be
 * stored there and must be added again). Nothing is uploaded: the API isn't connected.
 */
export function ModWizard({ categories, creator }: ModWizardProps) {
  const form = usePublishForm();
  const { values, setValues, errors, setErrors } = form;
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState<number[]>([0]);
  const [modFile, setModFile] = useState<File | null>(null);
  const [images, setImages] = useState<Preview[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  /** Errors to focus once the step we jumped to is on screen */
  const focusPending = useRef<ReturnType<typeof stepErrors> | null>(null);
  const reduce = useReducedMotion();

  const stored = parseDraft(useSyncExternalStore(subscribeDraft, readDraftRaw, () => null));
  const files = { modFile, images: images.map((p) => p.file) };
  const live = validatePublish(values, files, "review");

  // Autosave text fields shortly after the creator stops typing.
  useEffect(() => {
    if (!touched) return;
    const id = setTimeout(() => {
      const at = stamp();
      writeDraft({ values, savedAt: at });
      setSavedAt(at);
      setNow(at);
    }, 800);
    return () => clearTimeout(id);
  }, [values, touched]);

  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => setNow(stamp()), 5000);
    return () => clearInterval(id);
  }, [savedAt]);

  // After jumping to a step because of an error, focus its first invalid field once the step is on screen.
  function onStepShown() {
    if (!focusPending.current) return;
    // The outgoing step also reports "animation complete"; wait until the target field exists
    if (focusFirstError(panel.current, focusPending.current)) focusPending.current = null;
  }

  function jumpToErrors(all: ReturnType<typeof stepErrors>, target: number) {
    focusPending.current = stepErrors(all, target);
    if (target === step) return onStepShown();
    go(target);
    // Without motion the step swaps instantly and no animation event fires
    if (reduce) setTimeout(onStepShown, 50);
  }

  const change = <T,>(fn: (v: T) => void) => (v: T) => {
    setTouched(true);
    fn(v);
  };
  const tracked = {
    ...form,
    set: ((key, value) => {
      setTouched(true);
      form.set(key, value);
    }) as typeof form.set,
    text: ((key) => {
      const t = form.text(key);
      return { ...t, onChange: (e: { target: { value: string } }) => (setTouched(true), t.onChange(e)) };
    }) as typeof form.text,
  };

  function go(next: number) {
    setStep(next);
    setVisited((v) => (v.includes(next) ? v : [...v, next]));
    panel.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }

  function nextStep() {
    const current = stepErrors(live, step);
    if (hasErrors(current)) {
      setErrors((e) => ({ ...e, ...current }));
      focusFirstError(panel.current, current);
      return;
    }
    go(step + 1);
  }

  function saveDraft() {
    const titleOnly = validatePublish(values, files, "draft");
    if (hasErrors(titleOnly)) {
      setErrors(titleOnly);
      jumpToErrors(titleOnly, 0);
      return;
    }
    const at = stamp();
    writeDraft({ values, savedAt: at });
    setSavedAt(at);
    setNow(at);
    setNotice("Borrador guardado en este navegador. Con la API se guardará en tu cuenta; no se subió ningún archivo.");
  }

  function submit() {
    setErrors(live);
    const first = firstStepWithErrors(live);
    if (first !== -1) {
      setNotice(null);
      jumpToErrors(live, first);
      return;
    }
    writeDraft(null);
    setNotice(
      "Todo listo para moderación. Con la API, los archivos se subirían con un enlace temporal, se analizarían contra malware y el mod quedaría “En revisión”. No se envió nada.",
    );
  }

  const preview = buildPreview(values, creator, images.length);
  const category = categories.find((c) => c.slug === values.categorySlug);

  return (
    <div className="space-y-6">
      {stored && !touched && !dismissed && (
        <div className="flex flex-wrap items-center gap-3 rounded-[4px] border border-concrete-2 bg-soot-2 px-4 py-3 text-sm">
          <History className="size-4 text-flare" aria-hidden />
          <p className="flex-1">
            Tienes un borrador sin terminar: <strong>{stored.values.title || "sin título"}</strong>.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setValues(stored.values);
              setTouched(true);
              setNotice("Borrador restaurado. Vuelve a añadir el archivo y las capturas: no se guardan en el navegador.");
            }}
          >
            Restaurar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDismissed(true);
              writeDraft(null);
            }}
          >
            Descartar
          </Button>
        </div>
      )}

      {/* Stepper */}
      <nav aria-label="Pasos para publicar">
        <ol className="grid grid-cols-5 gap-1.5">
          {WIZARD_STEPS.map((s, i) => {
            const bad = visited.includes(i) && i !== step && hasErrors(stepErrors(errors, i));
            const done = visited.includes(i) && i !== step && !hasErrors(stepErrors(live, i));
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === step ? "step" : undefined}
                  className="group w-full text-left"
                >
                  <span
                    className={cn(
                      "block h-1 rounded-full transition-colors",
                      i === step ? "bg-flare" : bad ? "bg-blood" : done ? "bg-bile" : "bg-concrete",
                    )}
                  />
                  <span className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className={cn("font-mono", i === step ? "text-flare" : "text-ash")}>{i + 1}</span>
                    <span className={cn("hidden truncate sm:inline", i === step ? "font-semibold text-bone" : "text-ash group-hover:text-bone")}>
                      {s.label}
                    </span>
                    {done && <Check className="size-3 text-bile" aria-label="completo" />}
                    {bad && <CircleAlert className="size-3 text-[#ff5a69]" aria-label="con errores" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <form
        method="post"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === WIZARD_STEPS.length - 1) submit();
          else nextStep();
        }}
      >
        <div ref={panel} className="scroll-mt-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={onStepShown}
            >
              {step === 0 && (
                <FormSection title="Información" description="Lo que verá la gente en el catálogo.">
                  <InfoFields form={tracked} categories={categories} />
                </FormSection>
              )}
              {step === 1 && (
                <FormSection title="Personaje" description="Así sabrá el comprador si choca con otro mod que ya tiene.">
                  <CharacterFields form={tracked} />
                </FormSection>
              )}
              {step === 2 && (
                <FormSection
                  title="Archivos y galería"
                  description="Los archivos se revisan en tu navegador y no se suben a ningún servidor en esta demo."
                >
                  <ModFileField
                    file={modFile}
                    error={errors.modFile}
                    onChange={change((f: File | null) => {
                      setModFile(f);
                      setErrors((e) => ({ ...e, modFile: undefined }));
                    })}
                  />
                  <GalleryField
                    images={images}
                    error={errors.images}
                    onChange={change((next: Preview[]) => {
                      setImages(next);
                      setErrors((e) => ({ ...e, images: undefined }));
                    })}
                  />
                  <TextField
                    label="Video (opcional)"
                    placeholder="https://youtu.be/…"
                    hint="Un enlace a un video donde se vea el personaje en el juego."
                    {...tracked.text("videoUrl")}
                  />
                </FormSection>
              )}
              {step === 3 && (
                <FormSection title="Precio y licencia" description="Gratis o de pago. Si le pones precio, elige la licencia de venta.">
                  <PriceField form={tracked} />
                  <LicenseFields form={tracked} />
                </FormSection>
              )}
              {step === 4 && (
                <div className="space-y-6">
                  <FormSection title="Revisión" description="Así se verá en la tienda. Comprueba que no falte nada antes de enviarlo.">
                    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Tarjeta del catálogo</p>
                        <div className="pointer-events-none" aria-hidden>
                          <ModCard mod={preview} creator={creator} category={category} />
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">Ficha</p>
                        <div className="rounded-[4px] border border-concrete bg-asphalt p-5">
                          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood">{category?.name ?? "Sin categoría"}</p>
                          <p className="mt-1 font-display text-4xl font-black uppercase leading-none">{values.title || "Sin título"}</p>
                          <p className="mt-3 text-sm text-bone/75">{values.summary || "Sin resumen."}</p>
                          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <dt className="text-ash">Reemplaza a</dt>
                              <dd className="font-semibold">{values.replaces ? SLOT_LABELS[values.replaces] : "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-ash">Precio</dt>
                              <dd className="font-mono font-semibold">{formatPrice(preview.price)}</dd>
                            </div>
                            <div className="col-span-2">
                              <dt className="text-ash">Incluye</dt>
                              <dd>{values.includes.map((p) => PART_LABELS[p]).join(" · ") || "—"}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection title="Lo que falta">
                    <ul className="space-y-2">
                      {WIZARD_STEPS.slice(0, -1).map((s, i) => {
                        const missing = Object.values(stepErrors(live, i)).filter(Boolean);
                        return (
                          <li key={s.id} className="flex gap-3 text-sm">
                            {missing.length ? (
                              <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#ff5a69]" aria-hidden />
                            ) : (
                              <Check className="mt-0.5 size-4 shrink-0 text-bile" aria-hidden />
                            )}
                            <div>
                              <button type="button" onClick={() => go(i)} className="font-semibold hover:text-flare">
                                {s.label}
                              </button>
                              {missing.length > 0 && <p className="text-xs text-ash">{missing.join(" ")}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </FormSection>

                  <FormSection title="Derechos de distribución" description="Moderación revisa esta declaración antes de aprobar el mod.">
                    <RightsFields form={tracked} />
                  </FormSection>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6">
          <FormNotice message={notice} />
        </div>

        <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center gap-2 border-t border-concrete bg-asphalt/95 px-4 py-4 backdrop-blur-md md:mx-0">
          <p className="mr-auto font-mono text-[11px] text-ash" aria-live="polite">
            {savedAt ? `Guardado ${ago(now - savedAt)}` : "Sin cambios guardados"}
          </p>
          <Button type="button" variant="ghost" onClick={saveDraft}>
            <Save className="size-4" aria-hidden />
            Guardar borrador
          </Button>
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => go(step - 1)}>
              <ArrowLeft className="size-4" aria-hidden />
              Atrás
            </Button>
          )}
          {step < WIZARD_STEPS.length - 1 ? (
            <Button type="submit">
              Siguiente
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="submit">
              <Send className="size-4" aria-hidden />
              Enviar a revisión
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

/** A throwaway Mod built from the form so the real catalog card can render the preview. */
function buildPreview(values: PublishValues, creator: Creator, galleryCount: number): Mod {
  const raw = values.price.trim().replace(",", ".");
  const price = raw && Number.isFinite(Number(raw)) ? Math.round(Number(raw) * 100) : null;
  return {
    id: "preview",
    slug: "preview",
    title: values.title || "Sin título",
    summary: values.summary || "Sin resumen.",
    description: [values.description],
    creatorSlug: creator.slug,
    categorySlug: values.categorySlug || "survivors",
    replaces: values.replaces || "nick",
    includes: values.includes,
    version: values.version,
    gameBuild: "2.2.x",
    price,
    rating: 0,
    ratingCount: 0,
    downloads: 0,
    publishedAt: "2026-11-06",
    updatedAt: "2026-11-06",
    tags: [],
    fileSizeMb: 0,
    requirements: [],
    install: [],
    changelog: [],
    license: { name: "", terms: "", allowsRedistribution: false, allowsCommercialUse: false },
    cover: { tone: "flare", code: "NUEVO" },
    galleryCount,
    hasVideo: Boolean(values.videoUrl),
    status: "DRAFT",
  };
}
