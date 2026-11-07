import { describe, expect, it } from "vitest";
import {
  hasErrors,
  passwordStrength,
  validateEmail,
  validateLogin,
  validateNewPassword,
  validateRegister,
  validateUsername,
} from "./validation";

const validRegister = {
  username: "pala_y_linterna",
  email: "jugador@ejemplo.test",
  password: "puerto2026sombra",
  confirm: "puerto2026sombra",
  acceptTerms: true,
};

describe("auth validation", () => {
  it("validates email format", () => {
    expect(validateEmail("")).toBeDefined();
    expect(validateEmail("no-es-correo")).toBeDefined();
    expect(validateEmail("jugador@ejemplo.test")).toBeUndefined();
  });

  it("restricts usernames to 3–20 safe characters", () => {
    expect(validateUsername("ab")).toBeDefined();
    expect(validateUsername("con espacio")).toBeDefined();
    expect(validateUsername("<script>")).toBeDefined();
    expect(validateUsername("Nodo_Sur-9")).toBeUndefined();
  });

  it("requires long passwords mixing letters and numbers", () => {
    expect(validateNewPassword("corta1")).toBeDefined();
    expect(validateNewPassword("sololetraslargas")).toBeDefined();
    expect(validateNewPassword("letras1234numeros")).toBeUndefined();
  });

  it("scores password strength", () => {
    expect(passwordStrength("")).toBe(0);
    expect(passwordStrength("abc")).toBe(1);
    expect(passwordStrength("Puerto-Sombra-2026!")).toBe(4);
  });

  it("validates the login form", () => {
    expect(hasErrors(validateLogin({ email: "", password: "" }))).toBe(true);
    expect(hasErrors(validateLogin({ email: "a@b.co", password: "x" }))).toBe(false);
  });

  it("validates the register form", () => {
    expect(hasErrors(validateRegister(validRegister))).toBe(false);
    expect(validateRegister({ ...validRegister, confirm: "otra" }).confirm).toBeDefined();
    expect(validateRegister({ ...validRegister, acceptTerms: false }).acceptTerms).toBeDefined();
  });
});
