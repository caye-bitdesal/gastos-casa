"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { calcularReparto, calcularTransferencias, type Transferencia } from "@/lib/reparto";

type Estado = "cargando" | "cargado" | "error" | "sin-hogar";

export default function RepartoVista() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [sinGastos, setSinGastos] = useState(false);

  useEffect(() => {
    const hogarId = localStorage.getItem("hogarId");
    if (!hogarId) {
      setEstado("sin-hogar");
      return;
    }

    const gastosRef = collection(db, "hogares", hogarId, "gastos");
    getDocs(gastosRef)
      .then((snap) => {
        if (snap.empty) {
          setSinGastos(true);
          setTransferencias([]);
          setEstado("cargado");
          return;
        }

        const gastos = snap.docs.map((d) => {
          const data = d.data();
          return {
            importe: data["importe"] as number,
            pagadoPor: data["pagadoPor"] as string,
          };
        });

        const miembrosSet = new Set(gastos.map((g) => g.pagadoPor));
        const miembros = Array.from(miembrosSet);

        const balance = calcularReparto(gastos, miembros);
        const resultado = calcularTransferencias(balance);
        setTransferencias(resultado);
        setSinGastos(false);
        setEstado("cargado");
      })
      .catch(() => {
        setErrorMsg("No se pudo calcular el reparto. Inténtalo de nuevo.");
        setEstado("error");
      });
  }, []);

  if (estado === "cargando") {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-neutral-500" role="status" aria-live="polite">
          Calculando reparto…
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
      <h1 className="text-2xl font-semibold">Reparto de deuda</h1>

      {sinGastos ? (
        <p className="mt-6 text-neutral-500">Sin gastos aún. Añade gastos para ver el reparto.</p>
      ) : transferencias.length === 0 ? (
        <p className="mt-6 text-green-700 font-medium">Todo saldado — nadie debe nada.</p>
      ) : (
        <ul className="mt-6 space-y-3" aria-label="Lista de transferencias">
          {transferencias.map((t, idx) => (
            <li
              key={idx}
              className="rounded border border-neutral-200 bg-white px-4 py-3 text-sm"
            >
              <span className="font-medium">{t.de}</span>
              {" le debe "}
              <span className="font-semibold text-blue-700">{t.importe.toFixed(2)} €</span>
              {" a "}
              <span className="font-medium">{t.a}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link
          href="/hogar"
          className="text-sm text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Volver al hogar
        </Link>
      </div>
    </main>
  );
}
