"use client";

import { useState } from "react";
import type { CreatorReview } from "@/types/creator";

/** Local review state for the demo: replies and reports live only in this tab. */
export function useReviews(initial: CreatorReview[], today: string) {
  const [reviews, setReviews] = useState(initial);
  const [notice, setNotice] = useState<string | null>(null);
  return {
    reviews,
    notice,
    reply(id: string, body: string) {
      setReviews((list) => list.map((r) => (r.id === id ? { ...r, reply: { body, date: today } } : r)));
      setNotice("Respuesta publicada (solo en esta demo; se pierde al recargar).");
    },
    report(_id: string, reason: string) {
      setNotice(`Reporte “${reason}” listo para la cola de moderación. No se envió nada: el backend aún no está conectado.`);
    },
  };
}
