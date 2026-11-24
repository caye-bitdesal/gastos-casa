"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { obtenerHogar, type HogarDoc } from "@/lib/hogares";

type Estado = "cargando" | "cargado" | "error" | "sin-hogar";

export default function HogarVista() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [hogar, setHogar] = useState<HogarDoc | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const hogarId = localStorage.getItem("hogarId");
    if (!hogarId) {
      setEstado("sin-hogar");
      return;
    }

    obtenerHogar(hogarId)
      .then((data) => {
        if (!data) {
          localStorage.removeItem("hogarId");
          setEstado("sin-hogar");
        } else {
          setHogar(data);
          setEstado("cargado");
        }
      })
      .catch(() => {
        setErrorMsg("No se pudieron cargar los datos del hogar.");
        setEstado("error");
      });
  }, []);

  if (estado === "cargando") {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-neutral-500" role="status" aria-live="polite">
          Cargando hogar…
        </p>
      </main>
    );
  }

  if (estado === "sin-hogar") {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-neutral-500">No se encontró ningún hogar.</p>
        <button
          onClick={() => router.replace("/")}
          className="mt-4 text-blue-600 underline text-sm"
        >
          Crear un hogar
        </button>
      </main>
    );
  }

  if (estado === "error") {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-red-600" role="alert">
          {errorMsg}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 underline text-sm"
        >
          Reintentar
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">{hogar?.nombre}</h1>
      <p className="mt-2 text-neutral-500 text-sm">
        Hogar creado correctamente. Los gastos aparecerán aquí en próximas versiones.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/hogar/nuevo-gasto"
          className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Añadir gasto
        </Link>
        <Link
          href="/hogar/gastos"
          className="inline-block rounded border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          Ver gastos
        </Link>
        <Link
          href="/hogar/reparto"
          className="inline-block rounded border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          Ver reparto
        </Link>
      </div>
    </main>
  );
}
