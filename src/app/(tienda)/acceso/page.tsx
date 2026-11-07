import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/AuthShell";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Cuenta"
      title="Vuelve a la sala segura"
      intro="Inicia sesión para ver tus favoritos, tu historial de descargas y tus reseñas."
      doorLabel={"Sala\nsegura"}
      perks={["Tus favoritos en cualquier dispositivo", "Historial de descargas", "Valora y comenta mods"]}
    >
      <LoginForm />
    </AuthShell>
  );
}
