"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { obtenerGastos, eliminarGasto, type GastoDoc } from "@/lib/gastos";
import { extraerMeses, filtrarGastos } from "@/lib/filtros-gastos";
import { obtenerHogar } from "@/lib/hogares";
import { FiltrosGastos } from "./FiltrosGastos";
import { TablaGastos } from "./TablaGastos";

type Estado = "cargando" | "cargado" | "error";

export default function GastosLista() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [gastos, setGastos] = useState<GastoDoc[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [hogarId, setHogarId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filtroCat, setFiltroCat] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("hogarId");
    if (!id) {
      router.replace("/");
      return;
    }
    setHogarId(id);

    Promise.all([obtenerGastos(id), obtenerHogar(id)])
      .then(([gastosData, hogarData]) => {
        setGastos(gastosData);
        setCategorias(hogarData?.categorias ?? []);
        setEstado("cargado");
      })
      .catch(() => {
        setErrorMsg("No se pudieron cargar los gastos.");
        setEstado("error");
      });
  }, [router]);

  async function handleEliminar(gasto: GastoDoc) {
    const confirmMsg = `¿Eliminar "${gasto.descripcion || gasto.categoria}" de ${gasto.importe.toFixed(2)} €?`;
    if (!window.confirm(confirmMsg)) return;
    setEliminando(gasto.id);
    try {
      await eliminarGasto(hogarId, gasto.id);
      setGastos((prev) => prev.filter((g) => g.id !== gasto.id));
    } catch {
      alert("Error al eliminar el gasto. Inténtalo de nuevo.");
    } finally {
      setEliminando(null);
    }
  }

  if (estado === "cargando") {
    return (
      <p className="text-neutral-500" role="status" aria-live="polite">
        Cargando gastos…
      </p>
    );
  }

  if (estado === "error") {
    return (
      <div>
        <p className="text-red-600" role="alert">
          {errorMsg}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-600 underline text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const meses = extraerMeses(gastos);
  const gastosFiltrados = filtrarGastos(gastos, filtroCat, filtroMes);

  return (
    <div className="space-y-6">
      <FiltrosGastos
        categorias={categorias}
        meses={meses}
        filtroCat={filtroCat}
        filtroMes={filtroMes}
        onCambiaCat={setFiltroCat}
        onCambiaMes={setFiltroMes}
      />

      {gastos.length === 0 ? (
        <div className="rounded border border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-neutral-500">Todavía no hay gastos registrados en este hogar.</p>
          <Link
            href="/hogar/nuevo-gasto"
            className="mt-4 inline-block text-blue-600 underline text-sm"
          >
            Añadir el primer gasto
          </Link>
        </div>
      ) : gastosFiltrados.length === 0 ? (
        <div className="rounded border border-neutral-200 bg-neutral-50 p-8 text-center">
          <p className="text-neutral-500">
            No hay gastos que coincidan con los filtros seleccionados.
          </p>
          <button
            onClick={() => { setFiltroCat(""); setFiltroMes(""); }}
            className="mt-3 text-blue-600 underline text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <TablaGastos
          gastos={gastosFiltrados}
          eliminando={eliminando}
          onEliminar={handleEliminar}
        />
      )}

      <div className="pt-2">
        <Link
          href="/hogar"
          className="text-sm text-neutral-500 hover:text-neutral-700 underline"
        >
          Volver al hogar
        </Link>
      </div>
    </div>
  );
}
