import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/AuthShell";
import { RecoverForm } from "@/features/auth/RecoverForm";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecoverPage() {
  return (
    <AuthShell
      eyebrow="Recuperar acceso"
      title="¿Perdiste la llave?"
      intro="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
      doorLabel={"Otra\nllave"}
      perks={["El enlace caduca en 30 minutos", "Solo funciona una vez", "Tu contraseña anterior deja de servir"]}
    >
      <RecoverForm />
    </AuthShell>
  );
}
