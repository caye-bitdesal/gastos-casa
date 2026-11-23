"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { crearHogarSchema } from "@/lib/hogares.schema";
import { crearHogar } from "@/lib/hogares";

type FormState = "idle" | "loading" | "error";

export default function HogarRedirect() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [nombre, setNombre] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hogarId = localStorage.getItem("hogarId");
    if (hogarId) {
      router.replace("/hogar");
    } else {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    if (!checking) {
      inputRef.current?.focus();
    }
  }, [checking]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const validation = crearHogarSchema.safeParse({ nombre });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message ?? "Nombre inválido");
      return;
    }

    setFormState("loading");
    try {
      const hogarId = await crearHogar(validation.data.nombre);
      localStorage.setItem("hogarId", hogarId);
      router.push("/hogar");
    } catch {
      setFormState("error");
      setErrorMsg("No se pudo crear el hogar. Inténtalo de nuevo.");
    }
  }

  if (checking) {
    return (
      <main className="mx-auto max-w-md p-8">
        <p className="text-neutral-500" role="status" aria-live="polite">
          Cargando…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-6">Crear tu hogar</h1>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1 mb-4">
          <label htmlFor="nombre" className="font-medium text-sm">
            Nombre del hogar
          </label>
          <input
            ref={inputRef}
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Casa Familiar"
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-required="true"
            aria-describedby={errorMsg ? "nombre-error" : undefined}
            disabled={formState === "loading"}
          />
          {errorMsg && (
            <p id="nombre-error" className="text-red-600 text-sm" role="alert">
              {errorMsg}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={formState === "loading"}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
        >
          {formState === "loading" ? "Creando…" : "Crear hogar"}
        </button>
      </form>
    </main>
  );
}
