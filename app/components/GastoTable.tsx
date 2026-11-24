"use client";

import { type GastoDoc } from "@/lib/gastos";

const CAT_CLASSES = ["c0", "c1", "c2", "c3"];

function getCatClass(categoria: string, categorias: string[]): string {
  const idx = categorias.indexOf(categoria);
  return CAT_CLASSES[idx % CAT_CLASSES.length] ?? "c2";
}

function formatDate(fecha: string): string {
  const [year, month, day] = fecha.split("-");
  if (!year || !month || !day) return fecha;
  return `${day}/${month}/${year}`;
}

function initials(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type Props = {
  gastos: GastoDoc[];
  categorias: string[];
  eliminando: string | null;
  onEditar: (gasto: GastoDoc) => void;
  onEliminar: (gasto: GastoDoc) => void;
};

export default function GastoTable({
  gastos,
  categorias,
  eliminando,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <div className="j-twrap">
      <table className="j-tt" aria-label="Lista de gastos">
        <thead>
          <tr>
            <th scope="col">Descripción</th>
            <th scope="col">Categoría</th>
            <th scope="col">Fecha</th>
            <th scope="col">Pagado por</th>
            <th scope="col" style={{ textAlign: "right" }}>Importe</th>
            <th scope="col"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((g) => (
            <tr key={g.id}>
              <td>
                <div className="j-tdesc">
                  <div className="j-txi" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M5 1.667v16.666l2.5-1.666 2.5 1.666 2.5-1.666 2.5 1.666V1.667l-2.5 1.666L10 1.667 7.5 3.333 5 1.667z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="j-tnm">{g.descripcion || g.categoria}</span>
                </div>
              </td>
              <td>
                <span className={`j-cbg ${getCatClass(g.categoria, categorias)}`}>
                  <span className="j-cd" aria-hidden="true" />
                  {g.categoria}
                </span>
              </td>
              <td className="j-tdate">{formatDate(g.fecha)}</td>
              <td>
                <div className="j-tpay">
                  <div className="j-tav" aria-hidden="true">{initials(g.pagadoPor)}</div>
                  {g.pagadoPor}
                </div>
              </td>
              <td className="j-tamt">{g.importe.toFixed(2)} €</td>
              <td>
                <div className="j-tac">
                  <button
                    className="j-ib"
                    onClick={() => onEditar(g)}
                    aria-label={`Editar ${g.descripcion || g.categoria}`}
                    title="Editar"
                  >
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M14.167 2.5a2.357 2.357 0 0 1 3.333 3.333L6.25 17.083l-4.583.834.833-4.584L14.167 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="j-ib del"
                    onClick={() => onEliminar(g)}
                    disabled={eliminando === g.id}
                    aria-label={`Eliminar ${g.descripcion || g.categoria}`}
                    title="Eliminar"
                  >
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3.333 5.833h13.334M8.333 9.167v5M11.667 9.167v5M4.167 5.833l.833 10a1.667 1.667 0 0 0 1.667 1.667h6.666a1.667 1.667 0 0 0 1.667-1.667l.833-10M7.5 5.833V3.5a.833.833 0 0 1 .833-.833h3.334a.833.833 0 0 1 .833.833v2.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
