"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/forms/TextField";
import { FormNotice } from "@/components/forms/FormNotice";
import { NO_BACKEND_NOTICE } from "./messages";
import { useAuthForm } from "./useAuthForm";
import { validateLogin } from "./validation";

export function LoginForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const { field, formRef, handleSubmit } = useAuthForm({ email: "", password: "" }, validateLogin, () =>
    setNotice(NO_BACKEND_NOTICE),
  );

  return (
    <form ref={formRef} method="post" onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField label="Correo" type="email" autoComplete="email" placeholder="tu@correo.com" {...field("email")} />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        labelAside={
          <Link href="/recuperar" className="text-xs font-medium text-flare hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        }
        {...field("password")}
      />
      <Button type="submit" size="lg" className="w-full">
        Iniciar sesión
      </Button>
      <FormNotice message={notice} />
      <p className="border-t border-concrete pt-5 text-center text-sm text-ash">
        ¿Primera vez aquí?{" "}
        <Link href="/registro" className="font-semibold text-bone hover:text-flare">
          Crea una cuenta
        </Link>
      </p>
    </form>
  );
}
