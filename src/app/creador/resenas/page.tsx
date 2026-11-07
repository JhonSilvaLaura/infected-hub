import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { ReviewsInbox } from "@/features/creators/ReviewsInbox";
import { DEMO_TODAY, getMyReviews } from "@/services/creator.service";

export const metadata: Metadata = { title: "Reseñas" };

export default function ReviewsPage() {
  return (
    <div>
      <DashboardTitle
        eyebrow="De tus compradores"
        title="Reseñas"
        description="Responde con calma y en público: tus respuestas se verán en la ficha del mod."
      />
      <Suspense>
        <ReviewsInbox initial={getMyReviews()} today={DEMO_TODAY} />
      </Suspense>
    </div>
  );
}
