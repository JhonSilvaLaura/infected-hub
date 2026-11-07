"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hasErrors } from "@/features/auth/validation";
import { formatDate, formatPrice } from "@/lib/format";
import type { CreatorSubmission } from "@/types/creator";
import { FormSection, LicenseFields, PriceField, type PublishForm } from "../publish-fields";
import { validatePrice, validatePublish } from "../publish-validation";

interface PriceTabProps {
  form: PublishForm;
  submission: CreatorSubmission;
  history: CreatorSubmission["priceHistory"];
  onSave: (price: number | null) => void;
}

export function PriceTab({ form, submission, history, onSave }: PriceTabProps) {
  const raw = form.values.price.trim().replace(",", ".");
  const next = raw && !validatePrice(form.values.price) ? Math.round(Number(raw) * 100) : null;
  const current = history.at(-1)?.price ?? submission.price;
  const freeToPaid = current === null && next !== null && submission.downloads > 0;

  function save() {
    const all = validatePublish(form.values, { modFile: null, images: [] }, "review", { isUpdate: true });
    const errors = { price: all.price, license: all.license };
    form.setErrors((e) => ({ ...e, ...errors }));
    if (hasErrors(errors)) return;
    onSave(next);
  }

  return (
    <div className="space-y-6">
      <form
        method="post"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <FormSection title="Precio" description={`Precio actual: ${formatPrice(current)}.`}>
          <PriceField form={form} />
          <LicenseFields form={form} />
          {freeToPaid && (
            <p className="flex gap-2 rounded-[3px] border border-flare/40 bg-flare/[0.06] p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-flare" aria-hidden />
              Pasará de gratis a pago. Las {submission.downloads.toLocaleString("es")} personas que ya lo descargaron lo
              conservan sin pagar.
            </p>
          )}
          <Button type="submit">Guardar precio</Button>
        </FormSection>
      </form>

      <section aria-labelledby="historial-precio">
        <h2 id="historial-precio" className="mb-3 font-semibold">
          Historial de precios
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-ash">Todavía no se ha publicado con precio.</p>
        ) : (
          <ol className="divide-y divide-concrete rounded-[4px] border border-concrete">
            {[...history].reverse().map((h, i) => (
              <li key={`${h.date}-${i}`} className="flex justify-between bg-soot px-4 py-3 text-sm">
                <time dateTime={h.date} className="font-mono text-ash">
                  {formatDate(h.date)}
                </time>
                <span className="font-mono font-semibold">{formatPrice(h.price)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
