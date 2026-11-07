import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { RouteSkeleton } from "@/components/layout/RouteSkeleton";
import { ModManager } from "@/features/creators/manager/ModManager";
import { getCategories } from "@/services/catalog.service";
import {
  DEMO_TODAY,
  getModDaily,
  getMyReviewsFor,
  getMySubmission,
  getMySubmissions,
  getRevenueByMod,
} from "@/services/creator.service";

export function generateStaticParams() {
  return getMySubmissions().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/creador/mods/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getMySubmission(id)?.title ?? "Mod no encontrado" };
}

export default function ManageModPage({ params }: PageProps<"/creador/mods/[id]">) {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      {params.then(({ id }) => (
        <ManageMod id={id} />
      ))}
    </Suspense>
  );
}

async function ManageMod({ id }: { id: string }) {
  // With the API this request is authenticated and the server returns 404 for mods that aren't yours.
  const submission = getMySubmission(id);
  if (!submission) notFound();

  return (
    <div>
      <Link href="/creador/mods" className="mb-6 inline-flex items-center gap-2 text-sm text-ash hover:text-bone">
        <ArrowLeft className="size-4" aria-hidden />
        Mis mods
      </Link>
      <Suspense fallback={<RouteSkeleton />}>
        <ModManager
          submission={submission}
          categories={getCategories()}
          reviews={getMyReviewsFor(id)}
          daily={getModDaily(id)}
          net30={getRevenueByMod(30).find((r) => r.modId === id)?.net ?? 0}
          today={DEMO_TODAY}
        />
      </Suspense>
    </div>
  );
}
