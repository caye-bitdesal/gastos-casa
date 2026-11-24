"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { obtenerHogar } from "@/lib/hogares";
import {
  filtrarGastosMes, calcularResumenMes, calcularComparativa, type GastoResumen,
} from "@/lib/resumen-mensual";
import { formatearMes } from "@/lib/filtros-gastos";
import { type GastoDoc, eliminarGasto, obtenerGastos } from "@/lib/gastos";
import { calcularReparto, calcularTransferencias } from "@/lib/reparto";
import StatCard from "@/app/components/StatCard";
import DonutChart from "@/app/components/DonutChart";
import MemberBar from "@/app/components/MemberBar";
import GastoTable from "@/app/components/GastoTable";
import GastoModal from "@/app/components/GastoModal";
import ResumenHeader from "./ResumenHeader";

type Estado = "cargando" | "cargado" | "error" | "sin-hogar";

function mesAnterior(a: number, m: number) {
  return m === 1 ? { anyo: a - 1, mes: 12 } : { anyo: a, mes: m - 1 };
}
function mesSiguiente(a: number, m: number) {
  return m === 12 ? { anyo: a + 1, mes: 1 } : { anyo: a, mes: m + 1 };
}

const WALLET_ICON = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
    <path d="M16.667 5.833v-1.666A1.667 1.667 0 0 0 15 2.5H4.167a2.5 2.5 0 0 0 0 5H16.667V17.5H4.167a2.5 2.5 0 0 1 0-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.333 11.667h.009" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const RECEIPT_ICON = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
    <path d="M5 1.667v16.666l2.5-1.666 2.5 1.666 2.5-1.666 2.5 1.666V1.667l-2.5 1.666L10 1.667 7.5 3.333 5 1.667z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 7.5h5M7.5 10.833h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const USERS_ICON = (
  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
    <path d="M13.333 17.5v-1.667c0-.884-.351-1.732-.976-2.357A3.333 3.333 0 0 0 10 12.5H5a3.333 3.333 0 0 0-3.333 3.333V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.833 5.833a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ResumenMensualVista() {
  const router = useRouter();
  const hoy = new Date();
  const [anyo, setAnyo] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [gastos, setGastos] = useState<GastoResumen[]>([]);
  const [gastosDocs, setGastosDocs] = useState<GastoDoc[]>([]);
  const [hogarId, setHogarId] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [miembros, setMiembros] = useState<string[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [errorMsg, setErrorMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoEditar, setGastoEditar] = useState<GastoDoc | undefined>();
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("hogarId");
    if (!id) { setEstado("sin-hogar"); return; }
    setHogarId(id);
    Promise.all([obtenerGastos(id), obtenerHogar(id)])
      .then(([docs, hogar]) => {
        const sorted = [...docs].sort((a, b) => b.fecha.localeCompare(a.fecha));
        const resumen: GastoResumen[] = docs.map((d) => ({
          importe: d.importe, categoria: d.categoria, fecha: d.fecha, pagadoPor: d.pagadoPor,
        }));
        setGastos(resumen);
        setGastosDocs(sorted);
        setCategorias(hogar?.categorias ?? []);
        setMiembros(hogar?.miembros ?? []);
        setEstado("cargado");
      })
      .catch(() => { setErrorMsg("No se pudieron cargar los gastos."); setEstado("error"); });
  }, []);

  if (estado === "cargando") return <p className="j-loading" role="status" aria-live="polite">Cargando resumen…</p>;
  if (estado === "sin-hogar") return <div className="j-loading"><p>No se encontró ningún hogar.</p><button onClick={() => router.replace("/")} style={{ color: "var(--pri)", background: "none", border: "none", cursor: "pointer" }}>Crear un hogar</button></div>;
  if (estado === "error") return <div className="j-err" role="alert"><p>{errorMsg}</p><button onClick={() => window.location.reload()} style={{ color: "var(--pri)", background: "none", border: "none", cursor: "pointer" }}>Reintentar</button></div>;

  const prev = mesAnterior(anyo, mes);
  const sig = mesSiguiente(anyo, mes);
  const mesStr = String(mes).padStart(2, "0");
  const etiquetaMes = formatearMes(`${anyo}-${mesStr}`);
  const gastosMes = filtrarGastosMes(gastos, anyo, mes);
  const resumen = calcularResumenMes(gastosMes);
  const comparativa = calcularComparativa(resumen.total, calcularResumenMes(filtrarGastosMes(gastos, prev.anyo, prev.mes)).total);
  const ultimos3 = gastosDocs.filter((g) => g.fecha.startsWith(`${anyo}-${mesStr}`)).slice(0, 3);
  const transferencias = calcularTransferencias(calcularReparto(gastos.map((g) => ({ importe: g.importe, pagadoPor: g.pagadoPor })), miembros));
  const mayorDeuda = transferencias[0];

  const badgeVariant = comparativa.porcentaje === null ? "neutral" : comparativa.porcentaje <= 0 ? "green" : "coral";
  const badgeText = comparativa.porcentaje !== null ? `${comparativa.porcentaje > 0 ? "▲" : "▼"}${Math.abs(comparativa.porcentaje)}%` : etiquetaMes;

  function handleModalSaved(g: GastoDoc) {
    setGastosDocs((prev) => { const i = prev.findIndex((x) => x.id === g.id); if (i >= 0) { const n = [...prev]; n[i] = g; return n; } return [g, ...prev]; });
    setGastos((prev) => { const updated = { importe: g.importe, categoria: g.categoria, fecha: g.fecha, pagadoPor: g.pagadoPor }; return [...prev.filter((_, i) => gastosDocs[i]?.id !== g.id), updated]; });
    setModalOpen(false); setGastoEditar(undefined);
  }

  function handleEliminar(g: GastoDoc) {
    if (!window.confirm(`¿Eliminar "${g.descripcion || g.categoria}"?`)) return;
    setEliminando(g.id);
    eliminarGasto(hogarId, g.id)
      .then(() => { setGastosDocs((p) => p.filter((x) => x.id !== g.id)); setGastos((p) => p.filter((x) => !(x.fecha === g.fecha && x.categoria === g.categoria && x.importe === g.importe))); })
      .catch(() => alert("Error al eliminar."))
      .finally(() => setEliminando(null));
  }

  return (
    <>
      <ResumenHeader etiquetaMes={etiquetaMes} onPrev={() => { setAnyo(prev.anyo); setMes(prev.mes); }} onNext={() => { setAnyo(sig.anyo); setMes(sig.mes); }} onAddGasto={() => { setGastoEditar(undefined); setModalOpen(true); }} />
      <div className="j-pc">
        <div className="j-stats">
          <StatCard label="Gastado este mes" value={`${resumen.total.toFixed(2)} €`} note={`frente a ${calcularResumenMes(filtrarGastosMes(gastos, prev.anyo, prev.mes)).total.toFixed(2)} € el mes anterior`} variant="primary" badgeText={badgeText} badgeVariant={badgeVariant} icon={WALLET_ICON} />
          <StatCard label="Tu parte del mes" value={`${(resumen.total / 2).toFixed(2)} €`} note="50% de los gastos compartidos" variant="secondary" badgeText={etiquetaMes.split(" ")[1] ?? etiquetaMes} badgeVariant="neutral" icon={RECEIPT_ICON} />
          <StatCard label="Balance actual" value={mayorDeuda ? `${mayorDeuda.importe.toFixed(2)} €` : "0,00 €"} note={mayorDeuda ? `${mayorDeuda.de} debe a ${mayorDeuda.a}` : "Todo saldado"} variant="neutral" badgeText="Pendiente" badgeVariant={mayorDeuda ? "coral" : "neutral"} icon={USERS_ICON} />
        </div>
        {gastosMes.length > 0 && (
          <div className="j-pgrid">
            <div className="j-panel">
              <div className="j-pnt">Gastos por categoría</div>
              <div className="j-pns">Distribución durante {etiquetaMes}</div>
              <DonutChart segments={resumen.porCategoria.map((c) => ({ label: c.categoria, importe: c.importe, porcentaje: c.porcentaje }))} totalLabel={resumen.total.toFixed(2)} />
            </div>
            <div className="j-panel">
              <div className="j-pnt">Reparto del mes</div>
              <div className="j-pns">Aportación de cada persona</div>
              <div className="j-mbars">
                {resumen.porMiembro.map((m, i) => <MemberBar key={m.nombre} nombre={m.nombre} importe={m.importe} porcentaje={resumen.total > 0 ? Math.round((m.importe / resumen.total) * 1000) / 10 : 0} index={i} />)}
              </div>
              <Link href="/hogar/reparto" className="j-vlink">Ver reparto completo <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
            </div>
          </div>
        )}
        <div className="j-sechd">
          <div><div className="j-sect">Últimos gastos</div><div className="j-secm">{ultimos3.length} movimientos · {etiquetaMes}</div></div>
          <Link href="/hogar/gastos" className="j-valn">Ver todos <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>
        </div>
        {ultimos3.length === 0
          ? <div className="j-empty"><div className="j-empty-t">Sin gastos en {etiquetaMes}</div><div className="j-empty-s">Añade un gasto para ver el resumen.</div></div>
          : <GastoTable gastos={ultimos3} categorias={categorias} eliminando={eliminando} onEditar={(g) => { setGastoEditar(g); setModalOpen(true); }} onEliminar={handleEliminar} />}
      </div>
      {modalOpen && <GastoModal hogarId={hogarId} categorias={categorias} miembros={miembros} gasto={gastoEditar} onClose={() => { setModalOpen(false); setGastoEditar(undefined); }} onSaved={handleModalSaved} />}
    </>
  );
}
