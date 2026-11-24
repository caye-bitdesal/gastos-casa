"use client";

import { type ResumenMes, type Comparativa } from "@/lib/resumen-mensual";

type Props = {
  resumen: ResumenMes;
  comparativa: Comparativa;
  etiquetaAnterior: string;
  totalAnterior: number;
};

export default function ResumenMesDetalle({
  resumen,
  comparativa,
  etiquetaAnterior,
  totalAnterior,
}: Props) {
  return (
    <div className="mt-6 space-y-6">
      <section aria-labelledby="total-mes">
        <h2
          id="total-mes"
          className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
        >
          Total gastado
        </h2>
        <p className="mt-1 text-3xl font-bold">{resumen.total.toFixed(2)} €</p>
      </section>

      <section aria-labelledby="desglose-categoria">
        <h2
          id="desglose-categoria"
          className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
        >
          Por categoría
        </h2>
        <ul className="mt-2 divide-y divide-neutral-100 rounded border border-neutral-200">
          {resumen.porCategoria.map((c) => (
            <li
              key={c.categoria}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span className="capitalize">{c.categoria}</span>
              <span className="text-neutral-600">
                {c.importe.toFixed(2)} €{" "}
                <span className="text-neutral-400">({c.porcentaje}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="reparto-mes">
        <h2
          id="reparto-mes"
          className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
        >
          Reparto del mes
        </h2>
        <ul className="mt-2 divide-y divide-neutral-100 rounded border border-neutral-200">
          {resumen.porMiembro.map((m) => (
            <li
              key={m.nombre}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span>{m.nombre}</span>
              <span className="font-medium">{m.importe.toFixed(2)} €</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="comparativa-mes">
        <h2
          id="comparativa-mes"
          className="text-sm font-semibold uppercase tracking-wide text-neutral-500"
        >
          Comparativa con {etiquetaAnterior}
        </h2>
        <p className="mt-1 text-sm">
          {totalAnterior === 0 ? (
            <span className="text-neutral-500">
              Sin datos del mes anterior para comparar.
            </span>
          ) : (
            <span
              className={
                comparativa.diferencia >= 0 ? "text-red-600" : "text-green-600"
              }
            >
              {comparativa.diferencia >= 0 ? "+" : ""}
              {comparativa.diferencia.toFixed(2)} €
              {comparativa.porcentaje !== null && (
                <>
                  {" ("}
                  {comparativa.diferencia >= 0 ? "+" : ""}
                  {comparativa.porcentaje}%)
                </>
              )}{" "}
              respecto a {etiquetaAnterior}
            </span>
          )}
        </p>
      </section>
    </div>
  );
}
