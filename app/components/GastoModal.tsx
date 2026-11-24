"use client";

import { useEffect, useRef, useState } from "react";
import {
  crearGasto,
  actualizarGasto,
  obtenerGasto,
  crearGastoSchema,
  type GastoDoc,
} from "@/lib/gastos";

type CampoError = Partial<Record<string, string>>;

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  hogarId: string;
  categorias: string[];
  miembros: string[];
  gasto?: GastoDoc;
  onClose: () => void;
  onSaved: (actualizado: GastoDoc) => void;
};

export default function GastoModal({
  hogarId,
  categorias,
  miembros,
  gasto,
  onClose,
  onSaved,
}: Props) {
  const [importe, setImporte] = useState(gasto ? String(gasto.importe) : "");
  const [descripcion, setDescripcion] = useState(gasto?.descripcion ?? "");
  const [categoria, setCategoria] = useState(gasto?.categoria ?? categorias[0] ?? "__nueva__");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [fecha, setFecha] = useState(gasto?.fecha ?? hoy());
  const [pagadoPor, setPagadoPor] = useState(gasto?.pagadoPor ?? "");
  const [errores, setErrores] = useState<CampoError>({});
  const [guardando, setGuardando] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gasto && !gasto.id) return;
    if (gasto) {
      obtenerGasto(hogarId, gasto.id)
        .then((g) => {
          if (!g) return;
          setImporte(String(g.importe));
          setDescripcion(g.descripcion);
          setCategoria(g.categoria);
          setFecha(g.fecha);
          setPagadoPor(g.pagadoPor);
        })
        .catch(() => { /* usa valores prop */ });
    }
  }, [gasto, hogarId]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    const categoriaFinal = categoria === "__nueva__" ? nuevaCategoria.trim() : categoria;
    const parsed = crearGastoSchema.safeParse({
      importe: parseFloat(importe),
      descripcion: descripcion || undefined,
      categoria: categoriaFinal,
      fecha,
      pagadoPor: pagadoPor.trim(),
    });
    if (!parsed.success) {
      const mapa: CampoError = {};
      for (const issue of parsed.error.issues) {
        const campo = String(issue.path[0] ?? "general");
        mapa[campo] = issue.message;
      }
      setErrores(mapa);
      return;
    }
    setGuardando(true);
    try {
      if (gasto) {
        await actualizarGasto(hogarId, gasto.id, parsed.data, categorias, miembros);
        onSaved({ ...gasto, ...parsed.data });
      } else {
        const newId = await crearGasto(hogarId, parsed.data, categorias, miembros);
        onSaved({
          id: newId,
          importe: parsed.data.importe,
          descripcion: parsed.data.descripcion ?? "",
          categoria: parsed.data.categoria,
          fecha: parsed.data.fecha,
          pagadoPor: parsed.data.pagadoPor,
          creadoEn: null,
        });
      }
    } catch {
      setErrores({ general: "Error al guardar. Inténtalo de nuevo." });
      setGuardando(false);
    }
  }

  const allCategorias = categorias.includes(categoria) ? categorias : categorias;

  return (
    <div className="j-mover" ref={overlayRef} onClick={handleOverlayClick} role="presentation">
      <div className="j-mbox" role="dialog" aria-modal="true" aria-label={gasto ? "Editar gasto" : "Añadir gasto"}>
        <button className="j-mcls" onClick={onClose} aria-label="Cerrar modal">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="j-mey">Movimiento</div>
        <div className="j-mtt">{gasto ? "Editar gasto" : "Añadir gasto"}</div>
        <div className="j-mst">Registra un gasto compartido del hogar.</div>

        {errores["general"] && (
          <p style={{ color: "var(--cor)", fontSize: "13px", marginBottom: "12px" }} role="alert">
            {errores["general"]}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="j-fg">
            <label className="j-fl" htmlFor="m-importe">Importe (€) *</label>
            <input id="m-importe" className="j-fi" type="number" step="0.01" min="0.01"
              value={importe} onChange={(e) => setImporte(e.target.value)}
              placeholder="0,00" required aria-required="true"
              aria-describedby={errores["importe"] ? "m-importe-err" : undefined} />
            {errores["importe"] && <p id="m-importe-err" style={{ color: "var(--cor)", fontSize: "12px", marginTop: "4px" }} role="alert">{errores["importe"]}</p>}
          </div>

          <div className="j-fg">
            <label className="j-fl" htmlFor="m-desc">Descripción</label>
            <input id="m-desc" className="j-fi" type="text"
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Compra semanal" />
          </div>

          <div className="j-frow">
            <div className="j-fg">
              <label className="j-fl" htmlFor="m-cat">Categoría *</label>
              <select id="m-cat" className="j-fi" value={categoria}
                onChange={(e) => setCategoria(e.target.value)} required aria-required="true">
                {allCategorias.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="__nueva__">Nueva…</option>
              </select>
            </div>
            <div className="j-fg">
              <label className="j-fl" htmlFor="m-fecha">Fecha *</label>
              <input id="m-fecha" className="j-fi" type="date"
                value={fecha} onChange={(e) => setFecha(e.target.value)} required aria-required="true" />
            </div>
          </div>

          {categoria === "__nueva__" && (
            <div className="j-fg">
              <label className="j-fl" htmlFor="m-newcat">Nueva categoría *</label>
              <input id="m-newcat" className="j-fi" type="text"
                value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)}
                required aria-required="true" />
            </div>
          )}

          <div className="j-fg">
            <label className="j-fl" htmlFor="m-pago">Quién pagó *</label>
            <input id="m-pago" className="j-fi" type="text" list="m-miembros-list"
              value={pagadoPor} onChange={(e) => setPagadoPor(e.target.value)}
              placeholder="Nombre" required aria-required="true"
              aria-describedby={errores["pagadoPor"] ? "m-pago-err" : undefined} />
            {miembros.length > 0 && (
              <datalist id="m-miembros-list">
                {miembros.map((m) => <option key={m} value={m} />)}
              </datalist>
            )}
            {errores["pagadoPor"] && <p id="m-pago-err" style={{ color: "var(--cor)", fontSize: "12px", marginTop: "4px" }} role="alert">{errores["pagadoPor"]}</p>}
          </div>

          <div className="j-mft">
            <button type="button" className="j-btn-s" onClick={onClose}>Cancelar</button>
            <button type="submit" className="j-btn-p" disabled={guardando}>
              {guardando ? "Guardando…" : gasto ? "Actualizar" : "Guardar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
