import type { Metadata } from "next";
import { DashboardTitle } from "@/components/layout/DashboardTitle";
import { ProfileForm } from "@/features/creators/ProfileForm";
import { getCategories } from "@/services/catalog.service";
import { getCurrentCreator } from "@/services/creator.service";

export const metadata: Metadata = { title: "Perfil" };

export default function ProfilePage() {
  return (
    <div>
      <DashboardTitle eyebrow="Lo que ven los compradores" title="Perfil" />
      <ProfileForm creator={getCurrentCreator()} categories={getCategories()} />
    </div>
  );
}
