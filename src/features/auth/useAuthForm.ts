"use client";

import { useRef, useState, type FormEvent } from "react";
import { hasErrors } from "./validation";

/**
 * Shared form state for auth screens: validates on submit, then re-validates
 * as the user types, and moves focus to the first invalid field.
 */
export function useAuthForm<V extends Record<string, string | boolean>, K extends keyof V & string>(
  initial: V,
  validate: (values: V) => Partial<Record<K, string>>,
  onValid: (values: V) => void,
) {
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = submitted ? validate(values) : {};

  const field = <F extends keyof V & string>(name: F) => ({
    name,
    value: values[name] as string,
    onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value })),
    error: (errors as Record<string, string | undefined>)[name],
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const result = validate(values) as Record<string, string | undefined>;
    if (hasErrors(result)) {
      const first = Object.keys(result).find((k) => result[k]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    onValid(values);
  }

  return { values, setValues, errors: errors as Partial<Record<K, string>>, field, formRef, handleSubmit };
}
