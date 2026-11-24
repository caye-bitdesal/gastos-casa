"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerGastos, eliminarGasto, type GastoDoc } from "@/lib/gastos";
import { extraerMeses, filtrarGastos, formatearMes } from "@/lib/filtros-gastos";
import { obtenerHogar } from "@/lib/hogares";
import GastoTable from "@/app/components/GastoTable";
import GastoModal from "@/app/components/GastoModal";

type Estado = "cargando" | "cargado" | "error";

export default function GastosLista() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [gastos, setGastos] = useState<GastoDoc[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [miembros, setMiembros] = useState<string[]>([]);
  const [hogarId, setHogarId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filtroCat, setFiltroCat] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoEditar, setGastoEditar] = useState<GastoDoc | undefined>();

  useEffect(() => {
    const id = localStorage.getItem("hogarId");
    if (!id) { router.replace("/"); return; }
    setHogarId(id);
    Promise.all([obtenerGastos(id), obtenerHogar(id)])
      .then(([gastosData, hogarData]) => {
        setGastos(gastosData);
        setCategorias(hogarData?.categorias ?? []);
        setMiembros(hogarData?.miembros ?? []);
        setEstado("cargado");
      })
      .catch(() => { setErrorMsg("No se pudieron cargar los gastos."); setEstado("error"); });
  }, [router]);

  async function handleEliminar(gasto: GastoDoc) {
    if (!window.confirm(`¿Eliminar "${gasto.descripcion || gasto.categoria}" de ${gasto.importe.toFixed(2)} €?`)) return;
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

  function handleModalSaved(g: GastoDoc) {
    setGastos((prev) => {
      const idx = prev.findIndex((x) => x.id === g.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = g; return n; }
      return [g, ...prev];
    });
    setModalOpen(false);
    setGastoEditar(undefined);
  }

  if (estado === "cargando") return <p className="j-loading" role="status" aria-live="polite">Cargando gastos…</p>;
  if (estado === "error") return <div className="j-err" role="alert"><p>{errorMsg}</p><button onClick={() => window.location.reload()} style={{ color: "var(--pri)", background: "none", border: "none", cursor: "pointer" }}>Reintentar</button></div>;

  const meses = extraerMeses(gastos);
  let gastosFiltrados = filtrarGastos(gastos, filtroCat, filtroMes);
  if (busqueda.trim()) {
    const q = busqueda.toLowerCase();
    gastosFiltrados = gastosFiltrados.filter((g) => g.descripcion.toLowerCase().includes(q) || g.categoria.toLowerCase().includes(q));
  }

  const etiquetaMesFiltro = filtroMes ? formatearMes(filtroMes) : "Todos los meses";
  const catLabel = filtroCat || "Todas";

  return (
    <>
      <div className="j-phd">
        <div>
          <div className="j-pey">Movimientos</div>
          <h1 className="j-pt">Gastos del hogar</h1>
          <p className="j-ps">Consulta, filtra y gestiona todos los gastos compartidos.</p>
        </div>
        <button className="j-btn-p" onClick={() => { setGastoEditar(undefined); setModalOpen(true); }}>
          <svg width="13" height="13" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 3.75v10.5M3.75 9h10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
          Añadir gasto
        </button>
      </div>
      <div className="j-pc">
        <div className="j-gtb">
          <div className="j-swrap">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="8.25" cy="8.25" r="5.25" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 15l-3-3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <input className="j-si2" type="text" placeholder="Buscar gasto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar gastos" />
          </div>
          <select className="j-fbtn" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} aria-label="Filtrar por mes" style={{ cursor: "pointer" }}>
            <option value="">Todos los meses</option>
            {meses.map((m) => <option key={m} value={m}>{formatearMes(m)}</option>)}
          </select>
          <select className="j-fbtn" value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} aria-label="Filtrar por categoría" style={{ cursor: "pointer" }}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {gastos.length === 0 ? (
          <div className="j-empty">
            <div className="j-empty-t">Sin gastos registrados</div>
            <div className="j-empty-s">Añade el primer gasto para empezar.</div>
          </div>
        ) : gastosFiltrados.length === 0 ? (
          <div className="j-empty">
            <div className="j-empty-t">Sin resultados</div>
            <div className="j-empty-s">No hay gastos para: {busqueda ? `"${busqueda}"` : ""} {catLabel !== "Todas" ? `· ${catLabel}` : ""} {etiquetaMesFiltro !== "Todos los meses" ? `· ${etiquetaMesFiltro}` : ""}</div>
            <button onClick={() => { setBusqueda(""); setFiltroCat(""); setFiltroMes(""); }} style={{ color: "var(--pri)", background: "none", border: "none", cursor: "pointer", marginTop: "12px", fontSize: "13px" }}>Limpiar filtros</button>
          </div>
        ) : (
          <GastoTable gastos={gastosFiltrados} categorias={categorias} eliminando={eliminando}
            onEditar={(g) => { setGastoEditar(g); setModalOpen(true); }} onEliminar={handleEliminar} />
        )}
      </div>

      {modalOpen && <GastoModal hogarId={hogarId} categorias={categorias} miembros={miembros} gasto={gastoEditar} onClose={() => { setModalOpen(false); setGastoEditar(undefined); }} onSaved={handleModalSaved} />}
    </>
  );
}
