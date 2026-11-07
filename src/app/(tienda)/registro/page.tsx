import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/AuthShell";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Cuenta nueva"
      title="Únete al grupo"
      intro="Una cuenta gratuita para guardar mods, valorarlos y, más adelante, publicar los tuyos."
      doorLabel={"Hay\nsitio"}
      perks={[
        "Guarda mods en favoritos",
        "Valora y comenta",
        "Solicita perfil de creador para publicar",
        "Sin pagos: la cuenta es gratuita",
      ]}
    >
      <RegisterForm />
    </AuthShell>
  );
}
