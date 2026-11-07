"use client";

import { useSyncExternalStore } from "react";

/**
 * A list of ids persisted in this browser, shared live between components and tabs.
 * Phase 1 only: carts, wishlists and the like move to the user's account with the API.
 */
export function createLocalListStore(key: string) {
  const event = `${key}:change`;

  const readRaw = () => {
    try {
      return localStorage.getItem(key) ?? "[]";
    } catch {
      return "[]";
    }
  };

  const parse = (raw: string): string[] => {
    try {
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  };

  const write = (ids: string[]) => {
    try {
      localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
    } catch {
      /* storage unavailable: the change lives until reload */
    }
    window.dispatchEvent(new Event(event));
  };

  const subscribe = (onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener(event, onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener(event, onChange);
    };
  };

  return {
    /** Ids in insertion order. Empty during SSR. */
    useIds: () => parse(useSyncExternalStore(subscribe, readRaw, () => "[]")),
    add: (id: string) => write([...parse(readRaw()), id]),
    remove: (id: string) => write(parse(readRaw()).filter((x) => x !== id)),
    toggle: (id: string) => {
      const ids = parse(readRaw());
      write(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    },
    clear: () => write([]),
  };
}
