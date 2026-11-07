/**
 * Client-side validation for auth forms. It improves feedback only:
 * the API (Spring Security + Jakarta Validation) remains the source of truth.
 */
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const PASSWORD_MIN = 10;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Escribe tu correo.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Ese correo no tiene un formato válido.";
}

export function validateUsername(username: string): string | undefined {
  if (!username.trim()) return "Elige un nombre de usuario.";
  if (!USERNAME_PATTERN.test(username)) return "Usa de 3 a 20 caracteres: letras, números, guion o guion bajo.";
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return "Crea una contraseña.";
  if (password.length < PASSWORD_MIN) return `Usa al menos ${PASSWORD_MIN} caracteres.`;
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) return "Combina letras y números.";
}

/** 0 = empty, 1 weak … 4 strong. */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= PASSWORD_MIN) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  return Math.max(1, score) as 1 | 2 | 3 | 4;
}

export function validateLogin(values: { email: string; password: string }): FieldErrors<"email" | "password"> {
  return {
    email: validateEmail(values.email),
    password: values.password ? undefined : "Escribe tu contraseña.",
  };
}

export interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirm: string;
  acceptTerms: boolean;
}

export function validateRegister(values: RegisterValues): FieldErrors<keyof RegisterValues> {
  return {
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirm: values.confirm === values.password ? undefined : "Las contraseñas no coinciden.",
    acceptTerms: values.acceptTerms ? undefined : "Debes aceptar las normas para crear la cuenta.",
  };
}

export const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean);
