import { FlaskConical } from "lucide-react";
import { USING_MOCK_DATA } from "@/services/catalog.service";

/** Visible label required while the catalog runs on simulated data (Fase 1). */
export function MockDataNotice() {
  if (!USING_MOCK_DATA) return null;
  return (
    <p className="inline-flex items-center gap-2 rounded-[2px] border border-dashed border-concrete-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ash">
      <FlaskConical className="size-3.5" aria-hidden />
      Datos de demostración — contenido ficticio
    </p>
  );
}
