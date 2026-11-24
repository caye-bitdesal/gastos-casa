"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  filtrarGastosMes,
  calcularResumenMes,
  calcularComparativa,
  type GastoResumen,
} from "@/lib/resumen-mensual";
import { formatearMes } from "@/lib/filtros-gastos";
import ResumenMesDetalle from "@/app/hogar/resumen/ResumenMesDetalle";

type Estado = "cargando" | "cargado" | "error" | "sin-hogar";

function mesAnterior(anyo: number, mes: number): { anyo: number; mes: number } {
  return mes === 1 ? { anyo: anyo - 1, mes: 12 } : { anyo, mes: mes - 1 };
}

function mesSiguiente(anyo: number, mes: number): { anyo: number; mes: number } {
  return mes === 12 ? { anyo: anyo + 1, mes: 1 } : { anyo, mes: mes + 1 };
}

export default function ResumenMensualVista() {
  const router = useRouter();
  const hoy = new Date();
  const [anyo, setAnyo] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [gastos, setGastos] = useState<GastoResumen[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const hogarId = localStorage.getItem("hogarId");
    if (!hogarId) {
      setEstado("sin-hogar");
      return;
    }
    const ref = collection(db, "hogares", hogarId, "gastos");
    getDocs(ref)
      .then((snap) => {
        const lista: GastoResumen[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            importe: data["importe"] as number,
            categoria: data["categoria"] as string,
            fecha: data["fecha"] as string,
            pagadoPor: data["pagadoPor"] as string,
          };
        });
        setGastos(lista);
        setEstado("cargado");
      })
      .catch(() => {
        setErrorMsg("No se pudieron cargar los gastos. Inténtalo de nuevo.");
        setEstado("error");
      });
  }, []);

  if (estado === "cargando") {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-neutral-500" role="status" aria-live="polite">
          Cargando resumen…
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

  const gastosMes = filtrarGastosMes(gastos, anyo, mes);
  const resumen = calcularResumenMes(gastosMes);
  const prev = mesAnterior(anyo, mes);
  const gastosMesAnterior = filtrarGastosMes(gastos, prev.anyo, prev.mes);
  const resumenAnterior = calcularResumenMes(gastosMesAnterior);
  const comparativa = calcularComparativa(resumen.total, resumenAnterior.total);
  const mesStr = String(mes).padStart(2, "0");
  const etiquetaMes = formatearMes(`${anyo}-${mesStr}`);
  const etiquetaAnterior = formatearMes(
    `${prev.anyo}-${String(prev.mes).padStart(2, "0")}`
  );
  const sig = mesSiguiente(anyo, mes);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Resumen mensual</h1>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => { setAnyo(prev.anyo); setMes(prev.mes); }}
          aria-label="Mes anterior"
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          ←
        </button>
        <span className="font-medium capitalize">{etiquetaMes}</span>
        <button
          onClick={() => { setAnyo(sig.anyo); setMes(sig.mes); }}
          aria-label="Mes siguiente"
          className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          →
        </button>
      </div>

      {gastosMes.length === 0 ? (
        <p className="mt-8 text-neutral-500">
          No hay gastos registrados en {etiquetaMes}. Añade algún gasto para ver el resumen.
        </p>
      ) : (
        <ResumenMesDetalle
          resumen={resumen}
          comparativa={comparativa}
          etiquetaAnterior={etiquetaAnterior}
          totalAnterior={resumenAnterior.total}
        />
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
