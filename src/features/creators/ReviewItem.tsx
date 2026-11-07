"use client";

import { Flag, MessageSquareReply } from "lucide-react";
import { useState } from "react";
import { TextAreaField } from "@/components/forms/TextAreaField";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Stars } from "@/components/ui/Rating";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { CreatorReview } from "@/types/creator";

const REPLY_MAX = 500;
const REPORT_REASONS = ["Spam o publicidad", "Insultos o acoso", "No habla del mod", "Información falsa"];

interface ReviewItemProps {
  review: CreatorReview;
  /** Show which mod the review belongs to (inbox view) */
  showMod?: boolean;
  onReply: (id: string, body: string) => void;
  onReport: (id: string, reason: string) => void;
}

export function ReviewItem({ review, showMod, onReply, onReport }: ReviewItemProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  function send() {
    const body = draft.trim();
    if (body.length < 2 || body.length > REPLY_MAX) {
      setError(`Escribe entre 2 y ${REPLY_MAX} caracteres.`);
      return;
    }
    onReply(review.id, body);
    setOpen(false);
    setDraft("");
  }

  return (
    <article className="px-5 py-4">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="font-semibold">{review.author}</p>
        <Stars value={review.rating} />
        <time dateTime={review.date} className="font-mono text-[11px] text-ash">
          {formatDate(review.date)}
        </time>
        {showMod && <span className="rounded-[2px] bg-soot-2 px-2 py-0.5 text-xs text-bone/80">{review.modTitle}</span>}
      </header>
      <p className="mt-2 text-sm text-bone/85">{review.body}</p>

      {review.reply && (
        <div className="mt-3 border-l-2 border-flare/60 pl-3">
          <p className="text-xs font-semibold text-flare">Tu respuesta · {formatDate(review.reply.date)}</p>
          <p className="mt-1 text-sm text-bone/80">{review.reply.body}</p>
        </div>
      )}

      {open ? (
        <form
          method="post"
          noValidate
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <TextAreaField
            label={`Responder a ${review.author}`}
            rows={3}
            max={REPLY_MAX}
            value={draft}
            error={error}
            autoFocus
            onChange={(e) => {
              setDraft(e.target.value);
              setError(undefined);
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" type="submit">
              Publicar respuesta
            </Button>
            <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-3 flex gap-2">
          {!review.reply && (
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              <MessageSquareReply className="size-4" aria-hidden />
              Responder
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setReporting(true)}>
            <Flag className="size-4" aria-hidden />
            Reportar
          </Button>
        </div>
      )}

      <Modal
        open={reporting}
        onClose={() => setReporting(false)}
        title="Reportar reseña"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setReporting(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!reason}
              onClick={() => {
                onReport(review.id, reason!);
                setReporting(false);
              }}
            >
              Enviar a moderación
            </Button>
          </>
        }
      >
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm text-ash">¿Qué problema tiene la reseña de {review.author}?</legend>
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-[3px] border px-3 py-2.5 text-sm transition-colors",
                reason === r ? "border-blood bg-blood/10" : "border-concrete hover:border-concrete-2",
              )}
            >
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--blood)]" />
              {r}
            </label>
          ))}
        </fieldset>
      </Modal>
    </article>
  );
}
