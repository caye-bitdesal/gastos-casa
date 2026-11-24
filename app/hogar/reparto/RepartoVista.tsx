"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { obtenerHogar } from "@/lib/hogares";
import { calcularReparto, calcularTransferencias, type Transferencia } from "@/lib/reparto";
import { type GastoDoc } from "@/lib/gastos";
import GastoModal from "@/app/components/GastoModal";

type Estado = "cargando" | "cargado" | "error" | "sin-hogar";

type Pago = { importe: number; pagadoPor: string };

export default function RepartoVista() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("cargando");
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [pagados, setPagados] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [hogarId, setHogarId] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [miembros, setMiembros] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("hogarId");
    if (!id) { setEstado("sin-hogar"); return; }
    setHogarId(id);
    Promise.all([getDocs(collection(db, "hogares", id, "gastos")), obtenerHogar(id)])
      .then(([snap, hogar]) => {
        const gastosList: Pago[] = snap.docs.map((d) => {
          const data = d.data();
          return { importe: data["importe"] as number, pagadoPor: data["pagadoPor"] as string };
        });
        const miembrosList = hogar?.miembros ?? Array.from(new Set(gastosList.map((g) => g.pagadoPor)));
        const totalGastos = gastosList.reduce((s, g) => s + g.importe, 0);
        const pagadosPorMiembro: Record<string, number> = {};
        for (const m of miembrosList) pagadosPorMiembro[m] = 0;
        for (const g of gastosList) { pagadosPorMiembro[g.pagadoPor] = (pagadosPorMiembro[g.pagadoPor] ?? 0) + g.importe; }
        const balance = calcularReparto(gastosList, miembrosList);
        setTransferencias(calcularTransferencias(balance));
        setPagados(pagadosPorMiembro);
        setTotal(Math.round(totalGastos * 100) / 100);
        setCategorias(hogar?.categorias ?? []);
        setMiembros(miembrosList);
        setEstado("cargado");
      })
      .catch(() => { setErrorMsg("No se pudo calcular el reparto."); setEstado("error"); });
  }, []);

  if (estado === "cargando") return <p className="j-loading" role="status" aria-live="polite">Calculando reparto…</p>;
  if (estado === "sin-hogar") return <div className="j-loading"><p>No se encontró ningún hogar.</p><button onClick={() => router.replace("/")} style={{ color: "var(--pri)", background: "none", border: "none", cursor: "pointer" }}>Crear un hogar</button></div>;
  if (estado === "error") return <div className="j-err" role="alert"><p>{errorMsg}</p><button onClick={() => window.location.reload()} style={{ color: "var(--pri)", background: "none", border: "none", cursor: "pointer" }}>Reintentar</button></div>;

  const principal = transferencias[0] ?? null;
  const partePorPersona = miembros.length > 0 ? Math.round((total / miembros.length) * 100) / 100 : 0;

  function initials(nombre: string) {
    return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  }

  return (
    <>
      <div className="j-phd">
        <div>
          <div className="j-pey">Balance</div>
          <h1 className="j-pt">Reparto de gastos</h1>
          <p className="j-ps">Un resumen claro de quién ha pagado y cuánto queda por compensar.</p>
        </div>
        <button className="j-btn-p" onClick={() => setModalOpen(true)}>
          <svg width="13" height="13" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 3.75v10.5M3.75 9h10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
          Añadir gasto
        </button>
      </div>

      <div className="j-pc">
        {total === 0 ? (
          <div className="j-empty">
            <div className="j-empty-t">Sin gastos aún</div>
            <div className="j-empty-s">Añade gastos para ver el reparto entre los miembros.</div>
          </div>
        ) : transferencias.length === 0 ? (
          <div className="j-rlay">
            <div className="j-rcard">
              <div className="j-rey">Estado del balance</div>
              <div className="j-rt" style={{ color: "var(--grn)" }}>Todo saldado</div>
              <div className="j-rnt">Los gastos están perfectamente repartidos. Nadie debe nada.</div>
            </div>
          </div>
        ) : principal ? (
          <div className="j-rlay">
            <div className="j-rcard">
              <div className="j-tvis">
                <div className="j-alg ca" aria-label={principal.a}>{initials(principal.a)}</div>
                <div className="j-tarrow" aria-hidden="true">
                  <div className="j-tline" />
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="j-alg vi" aria-label={principal.de}>{initials(principal.de)}</div>
              </div>
              <div className="j-rey">Para equilibrar las cuentas</div>
              <div className="j-rt">{principal.de} debe pagar a {principal.a}</div>
              <div className="j-ram" aria-label={`${principal.importe.toFixed(2)} euros`}>{principal.importe.toFixed(2)} €</div>
              <div className="j-rnt">Con este pago, los gastos quedarán repartidos al {miembros.length > 0 ? Math.round(100 / miembros.length) : 50}% entre los miembros.</div>
              <button className="j-btn-dk" disabled aria-label="Marcar como saldado (no disponible en esta versión)">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3.75 9l3 3 7.5-7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Marcar como saldado
              </button>
            </div>
            <div className="j-dpanel" aria-label="Detalle del reparto">
              <div className="j-dphd"><div className="j-dpht">Detalle del reparto</div></div>
              <div className="j-drow"><div className="j-dlabel">Total del mes</div><div className="j-dval">{total.toFixed(2)} €</div></div>
              <div className="j-drow"><div className="j-dlabel">Parte por persona</div><div className="j-dval">{partePorPersona.toFixed(2)} €</div></div>
              {miembros.map((m) => (
                <div key={m} className="j-drow">
                  <div className="j-dlabel">Pagado por {m}</div>
                  <div className="j-dval">{(pagados[m] ?? 0).toFixed(2)} €</div>
                </div>
              ))}
              <div className="j-drow hi">
                <div className="j-dlabel">Diferencia a compensar</div>
                <div className="j-dval">{principal.importe.toFixed(2)} €</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {modalOpen && (
        <GastoModal hogarId={hogarId} categorias={categorias} miembros={miembros}
          onClose={() => setModalOpen(false)}
          onSaved={(_g: GastoDoc) => { setModalOpen(false); window.location.reload(); }} />
      )}
    </>
  );
}
