import type { Metadata } from "next";
import { LibraryView } from "@/features/store/LibraryView";
import { getLibrary } from "@/services/store.service";

export const metadata: Metadata = { title: "Biblioteca" };

export default function LibraryPage() {
  return <LibraryView items={getLibrary()} />;
}
