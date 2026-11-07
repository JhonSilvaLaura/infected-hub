import type { Metadata } from "next";
import { AccountSettingsForm } from "@/features/store/AccountSettingsForm";
import { getDemoBuyer } from "@/services/store.service";

export const metadata: Metadata = { title: "Ajustes" };

export default function AccountSettingsPage() {
  const buyer = getDemoBuyer();
  return <AccountSettingsForm username={buyer.username} email={buyer.email} />;
}
