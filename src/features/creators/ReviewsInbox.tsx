"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormNotice } from "@/components/forms/FormNotice";
import { SelectFilter } from "@/components/forms/SearchInput";
import { FilterTabs } from "@/components/ui/FilterTabs";
import type { CreatorReview } from "@/types/creator";
import { ReviewItem } from "./ReviewItem";
import { useReviews } from "./useReviews";

type Status = "pending" | "all";
const STARS = ["ALL", "5", "4", "3", "2", "1"] as const;

export function ReviewsInbox({ initial, today }: { initial: CreatorReview[]; today: string }) {
  const params = useSearchParams();
  const { reviews, notice, reply, report } = useReviews(initial, today);
  const [status, setStatus] = useState<Status>(params.get("filtro") === "sin-responder" ? "pending" : "all");
  const [modId, setModId] = useState("ALL");
  const [stars, setStars] = useState<(typeof STARS)[number]>("ALL");

  const mods = [...new Map(reviews.map((r) => [r.modId, r.modTitle])).entries()];
  const shown = reviews.filter(
    (r) =>
      (status === "all" || !r.reply) && (modId === "ALL" || r.modId === modId) && (stars === "ALL" || r.rating === Number(stars)),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <FilterTabs
          label="Estado de las reseñas"
          value={status}
          onChange={setStatus}
          options={[
            { value: "pending", label: "Sin responder", count: reviews.filter((r) => !r.reply).length },
            { value: "all", label: "Todas", count: reviews.length },
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
          <SelectFilter
            label="Mod"
            value={modId}
            onChange={setModId}
            options={[{ value: "ALL", label: "Todos" }, ...mods.map(([id, title]) => ({ value: id, label: title }))]}
          />
          <SelectFilter
            label="Estrellas"
            value={stars}
            onChange={setStars}
            options={STARS.map((s) => ({ value: s, label: s === "ALL" ? "Todas" : `${s} ★` }))}
          />
        </div>
      </div>

      <FormNotice message={notice} />

      {shown.length === 0 ? (
        <p className="rounded-[4px] border border-dashed border-concrete-2 px-6 py-12 text-center text-sm text-ash">
          {status === "pending" ? "Respondiste todas las reseñas. Buen trabajo." : "Ninguna reseña coincide con estos filtros."}
        </p>
      ) : (
        <div className="divide-y divide-concrete rounded-[4px] border border-concrete bg-soot">
          {shown.map((r) => (
            <ReviewItem key={r.id} review={r} showMod onReply={reply} onReport={report} />
          ))}
        </div>
      )}
    </div>
  );
}
