"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/forms/TextField";
import { FormNotice } from "@/components/forms/FormNotice";
import { useAuthForm } from "./useAuthForm";
import { validateEmail } from "./validation";

export function RecoverForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const { field, formRef, handleSubmit } = useAuthForm(
    { email: "" },
    (v) => ({ email: validateEmail(v.email) }),
    () =>
      setNotice(
        "Cuando la API esté activa, si el correo tiene una cuenta recibirás un enlace válido por 30 minutos. No se envió ningún correo.",
      ),
  );

  return (
    <form ref={formRef} method="post" onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField label="Correo de tu cuenta" type="email" autoComplete="email" placeholder="tu@correo.com" {...field("email")} />
      <Button type="submit" size="lg" className="w-full">
        Enviar enlace
      </Button>
      <FormNotice message={notice} />
      <Link href="/acceso" className="inline-flex items-center gap-2 text-sm font-medium text-ash hover:text-bone">
        <ArrowLeft className="size-4" aria-hidden />
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
