"use client";

import { useSyncExternalStore } from "react";

/**
 * Demo sign-in: the chosen role lives in this browser only. It hides or shows UI and
 * nothing else — with the API, every request is authenticated and the server checks
 * the role (RBAC). Never treat this value as a permission.
 */
export type DemoRole = "buyer" | "creator" | "admin";

export const ROLE_INFO: Record<DemoRole, { label: string; user: string; home: string }> = {
  buyer: { label: "Comprador", user: "pala_y_linterna", home: "/cuenta/biblioteca" },
  creator: { label: "Creador", user: "FerroVieja", home: "/creador" },
  admin: { label: "Admin", user: "guardia_mayor", home: "/admin" },
};

const KEY = "infectedhub:demo-role";
const EVENT = `${KEY}:change`;
/** Used when storage is blocked, so signing in still works until reload. */
let memory: DemoRole | null = null;

const isRole = (v: unknown): v is DemoRole => v === "buyer" || v === "creator" || v === "admin";

function read(): DemoRole | null {
  try {
    const v = localStorage.getItem(KEY);
    return isRole(v) ? v : memory;
  } catch {
    return memory;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function write(role: DemoRole | null) {
  memory = role;
  try {
    if (role) localStorage.setItem(KEY, role);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the in-memory value is used */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** `undefined` while rendering on the server / hydrating, then the stored role or `null`. */
export function useDemoRole(): DemoRole | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export const signIn = (role: DemoRole) => write(role);
export const signOut = () => write(null);

/** Only same-site paths are accepted as a post-login destination. */
export function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
