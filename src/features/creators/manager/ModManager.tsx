"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, MessageSquareWarning } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { ModCover } from "@/components/cards/ModCover";
import { FormNotice } from "@/components/forms/FormNotice";
import { TextField } from "@/components/forms/TextField";
import { Button, buttonClass } from "@/components/ui/Button";
import { hasErrors } from "@/features/auth/validation";
import { formatDate, SLOT_LABELS } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CreatorReview, CreatorSubmission, DailyPoint, ModerationEvent, SubmissionVersion } from "@/types/creator";
import type { Category } from "@/types/mod";
import { CharacterFields, focusFirstError, FormSection, InfoFields, usePublishForm } from "../publish-fields";
import { compareSemver, validatePublish } from "../publish-validation";
import { ReviewItem } from "../ReviewItem";
import { StatusBadge } from "../StatusBadge";
import { submissionToValues } from "../submission-values";
import { useReviews } from "../useReviews";
import { GalleryEditor } from "./GalleryEditor";
import { PriceTab } from "./PriceTab";
import { StatsTab } from "./StatsTab";
import { VersionsTab } from "./VersionsTab";

const TABS = [
  { id: "detalles", label: "Detalles" },
  { id: "versiones", label: "Versiones" },
  { id: "galeria", label: "Galería" },
  { id: "precio", label: "Precio" },
  { id: "estadisticas", label: "Estadísticas" },
  { id: "resenas", label: "Reseñas" },
  { id: "moderacion", label: "Moderación" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const EVENT_LABELS: Record<ModerationEvent["event"], string> = {
  SUBMITTED: "Enviado a revisión",
  RESUBMITTED: "Reenviado a revisión",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  SUSPENDED: "Suspendido",
};

interface ModManagerProps {
  submission: CreatorSubmission;
  categories: Category[];
  reviews: CreatorReview[];
  daily: DailyPoint[];
  net30: number;
  today: string;
}

/**
 * Everything about one mod, in tabs. Edits stay in this tab (demo). With the API, editing a
 * published mod creates a new version in review while the current one stays public.
 */
export function ModManager({ submission, categories, reviews: initialReviews, daily, net30, today }: ModManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("tab");
  const tab: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : "detalles";

  const [mod, setMod] = useState(submission);
  const form = usePublishForm(submissionToValues(submission));
  const [notice, setNotice] = useState<string | null>(null);
  const { reviews, notice: reviewNotice, reply, report } = useReviews(initialReviews, today);
  const details = useRef<HTMLFormElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const live = mod.versions.find((v) => v.state === "LIVE");
  const inReview = mod.versions.find((v) => v.state === "IN_REVIEW");
  const isPublic = mod.status === "APPROVED";

  function select(id: TabId) {
    const next = new URLSearchParams(params.toString());
    if (id === "detalles") next.delete("tab");
    else next.set("tab", id);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setNotice(null);
  }

  function onTabKey(e: KeyboardEvent, i: number) {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + TABS.length) % TABS.length;
    tabRefs.current[n]?.focus();
    select(TABS[n].id);
  }

  function saveDetails() {
    const all = validatePublish(form.values, { modFile: null, images: [] }, "review", { isUpdate: true });
    const keys = ["title", "categorySlug", "summary", "description", "replaces", "includes", "videoUrl"] as const;
    const errors = Object.fromEntries(keys.map((k) => [k, all[k]]));
    form.setErrors(errors);
    if (hasErrors(errors)) return focusFirstError(details.current, errors);

    const { title, summary, description, categorySlug, replaces, includes } = form.values;
    const changes = { title, summary, description, categorySlug: categorySlug || mod.categorySlug, replaces: replaces || mod.replaces, includes };
    if (isPublic && !inReview) {
      const latest = mod.versions.map((v) => v.version).sort(compareSemver).at(-1)!;
      const [a, b] = latest.split(".").map(Number);
      const version = `${a}.${b + 1}.0`;
      setMod((m) => ({
        ...m,
        versions: [{ version, date: today, notes: ["Cambios en la ficha."], state: "IN_REVIEW" }, ...m.versions],
      }));
      setNotice(`Se creó v${version} con tus cambios y quedó en revisión. La ficha pública sigue mostrando v${mod.version} hasta que se apruebe (solo en esta demo).`);
    } else {
      setMod((m) => ({ ...m, ...changes, updatedAt: today }));
      setNotice(
        mod.status === "REJECTED"
          ? "Cambios guardados. Cuando estés listo, reenvíalo desde la pestaña Moderación (solo en esta demo)."
          : "Cambios guardados (solo en esta demo; se pierden al recargar).",
      );
    }
  }

  function addVersion(v: SubmissionVersion) {
    setMod((m) => ({ ...m, versions: [v, ...m.versions] }));
    setNotice(`v${v.version} enviada a revisión. La versión pública no cambia hasta que se apruebe (solo en esta demo).`);
  }

  function resubmit() {
    setMod((m) => ({
      ...m,
      status: "PENDING_REVIEW",
      moderationNote: "En cola de revisión. Tiempo estimado: 48 h.",
      moderationHistory: [...m.moderationHistory, { date: today, event: "RESUBMITTED" }],
    }));
    setNotice("Reenviado a revisión (solo en esta demo).");
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-5 md:flex-row md:items-center">
        <ModCover tone={mod.cover.tone} code="" category={mod.categorySlug} className="size-20 shrink-0 rounded-[4px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={mod.status} />
            <span className="font-mono text-xs text-ash">Reemplaza a {SLOT_LABELS[mod.replaces]}</span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-black uppercase leading-none md:text-5xl">{mod.title}</h1>
          <p className="mt-2 font-mono text-xs text-ash">
            {live ? `Pública: v${live.version}` : `Versión de trabajo: v${mod.version}`}
            {inReview && <span className="text-flare"> · En revisión: v{inReview.version}</span>}
            {" · "}actualizado {formatDate(mod.updatedAt)}
          </p>
        </div>
        {mod.slug && isPublic && (
          <Link href={`/mods/${mod.slug}`} className={buttonClass({ variant: "outline", size: "sm" })}>
            <ExternalLink className="size-4" aria-hidden />
            Ver en la tienda
          </Link>
        )}
      </header>

      <div role="tablist" aria-label="Secciones del mod" className="mb-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-concrete [scrollbar-width:none]">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              tab === t.id ? "border-blood text-bone" : "border-transparent text-ash hover:text-bone",
            )}
          >
            {t.label}
            {t.id === "resenas" && reviews.some((r) => !r.reply) && (
              <span className="ml-1.5 rounded-[2px] bg-blood px-1 font-mono text-[10px]">{reviews.filter((r) => !r.reply).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <FormNotice message={notice ?? reviewNotice} />
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "detalles" && (
          <form
            ref={details}
            method="post"
            noValidate
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              saveDetails();
            }}
          >
            {isPublic && (
              <p className="rounded-[3px] border border-dashed border-concrete-2 p-3 text-sm text-ash">
                Este mod está publicado: al guardar se crea una versión nueva que pasa por revisión. Mientras tanto, la
                tienda sigue mostrando la actual.
              </p>
            )}
            <FormSection title="Información">
              <InfoFields form={form} categories={categories} />
            </FormSection>
            <FormSection title="Personaje">
              <CharacterFields form={form} />
              <TextField label="Video (opcional)" placeholder="https://youtu.be/…" {...form.text("videoUrl")} />
            </FormSection>
            <Button type="submit">{isPublic ? "Guardar y enviar a revisión" : "Guardar cambios"}</Button>
          </form>
        )}

        {tab === "versiones" && <VersionsTab versions={mod.versions} canUpload={mod.status !== "DRAFT"} today={today} onAdd={addVersion} />}

        {tab === "galeria" && (
          <GalleryEditor
            count={mod.galleryCount}
            tone={mod.cover.tone}
            category={mod.categorySlug}
            onSave={(count) => {
              setMod((m) => ({ ...m, galleryCount: count }));
              setNotice(`Galería guardada con ${count} capturas (solo en esta demo; no se subió ninguna imagen).`);
            }}
          />
        )}

        {tab === "precio" && (
          <PriceTab
            form={form}
            submission={mod}
            history={mod.priceHistory}
            onSave={(price) => {
              setMod((m) => ({ ...m, price, priceHistory: [...m.priceHistory, { date: today, price }] }));
              setNotice("Precio guardado. Solo afecta a las compras siguientes (solo en esta demo).");
            }}
          />
        )}

        {tab === "estadisticas" &&
          (mod.status === "DRAFT" ? (
            <p className="rounded-[4px] border border-dashed border-concrete-2 px-6 py-12 text-center text-sm text-ash">
              Las estadísticas aparecen cuando el mod se publica.
            </p>
          ) : (
            <StatsTab submission={mod} daily={daily} net30={net30} />
          ))}

        {tab === "resenas" &&
          (reviews.length === 0 ? (
            <p className="rounded-[4px] border border-dashed border-concrete-2 px-6 py-12 text-center text-sm text-ash">
              Todavía no hay reseñas de este mod.
            </p>
          ) : (
            <div className="divide-y divide-concrete rounded-[4px] border border-concrete bg-soot">
              {reviews.map((r) => (
                <ReviewItem key={r.id} review={r} onReply={reply} onReport={report} />
              ))}
            </div>
          ))}

        {tab === "moderacion" && (
          <div className="space-y-6">
            {mod.moderationNote && (
              <div className="flex gap-3 rounded-[4px] border border-blood/50 bg-blood/[0.06] p-4">
                <MessageSquareWarning className="mt-0.5 size-5 shrink-0 text-[#ff5a69]" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">Nota de moderación</p>
                  <p className="mt-1 text-sm text-bone/80">{mod.moderationNote}</p>
                  {mod.status === "REJECTED" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => select("detalles")}>
                        Corregir detalles
                      </Button>
                      <Button size="sm" onClick={resubmit}>
                        Reenviar a revisión
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {mod.moderationHistory.length === 0 ? (
              <p className="text-sm text-ash">Este mod todavía no se ha enviado a revisión.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-concrete pl-6">
                {mod.moderationHistory.map((e, i) => (
                  <li key={`${e.date}-${i}`} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[29px] top-1.5 size-2.5 rounded-full border-2 border-asphalt",
                        e.event === "APPROVED" ? "bg-bile" : e.event === "REJECTED" || e.event === "SUSPENDED" ? "bg-blood" : "bg-flare",
                      )}
                    />
                    <p className="text-sm font-semibold">{EVENT_LABELS[e.event]}</p>
                    <time dateTime={e.date} className="font-mono text-xs text-ash">
                      {formatDate(e.date)}
                    </time>
                    {e.note && <p className="mt-1 text-sm text-bone/75">{e.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
