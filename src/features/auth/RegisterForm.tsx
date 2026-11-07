"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldError, TextField } from "@/components/forms/TextField";
import { cn } from "@/lib/cn";
import { FormNotice } from "@/components/forms/FormNotice";
import { NO_BACKEND_NOTICE } from "./messages";
import { useAuthForm } from "./useAuthForm";
import { PASSWORD_MIN, passwordStrength, validateRegister } from "./validation";

const STRENGTH = [
  { label: "", color: "" },
  { label: "Débil", color: "bg-blood" },
  { label: "Aceptable", color: "bg-flare" },
  { label: "Buena", color: "bg-bile" },
  { label: "Muy buena", color: "bg-bile" },
];

export function RegisterForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const { values, setValues, errors, field, formRef, handleSubmit } = useAuthForm(
    { username: "", email: "", password: "", confirm: "", acceptTerms: false as boolean },
    validateRegister,
    () => setNotice(NO_BACKEND_NOTICE),
  );
  const strength = passwordStrength(values.password);

  return (
    <form ref={formRef} method="post" onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField
        label="Nombre de usuario"
        autoComplete="username"
        placeholder="pala_y_linterna"
        hint="Es público: aparece en tus reseñas y comentarios."
        {...field("username")}
      />
      <TextField label="Correo" type="email" autoComplete="email" placeholder="tu@correo.com" {...field("email")} />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        hint={
          <div>
            <div className="mb-1.5 grid grid-cols-4 gap-1" aria-hidden>
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn("h-1 rounded-full transition-colors duration-300", i <= strength ? STRENGTH[strength].color : "bg-concrete")}
                />
              ))}
            </div>
            <span>
              Mínimo {PASSWORD_MIN} caracteres, con letras y números.
              {strength > 0 && <span className="text-bone/80"> Seguridad: {STRENGTH[strength].label}.</span>}
            </span>
          </div>
        }
        {...field("password")}
      />
      <TextField label="Repite la contraseña" type="password" autoComplete="new-password" {...field("confirm")} />

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-bone/85">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={values.acceptTerms}
            onChange={(e) => setValues((v) => ({ ...v, acceptTerms: e.target.checked }))}
            aria-invalid={Boolean(errors.acceptTerms)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--flare)]"
          />
          <span>
            Acepto las normas de la comunidad y entiendo que solo puedo publicar contenido propio o con permiso de su
            autor.
          </span>
        </label>
        <FieldError message={errors.acceptTerms} />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Crear cuenta
      </Button>
      <FormNotice message={notice} />
      <p className="text-xs text-ash">
        Te enviaremos un correo para verificar tu dirección antes de poder comentar o publicar.
      </p>
      <p className="border-t border-concrete pt-5 text-center text-sm text-ash">
        ¿Ya tienes cuenta?{" "}
        <Link href="/acceso" className="font-semibold text-bone hover:text-flare">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
