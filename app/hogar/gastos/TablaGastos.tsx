"use client";

import Link from "next/link";
import { type GastoDoc } from "@/lib/gastos";

type Props = {
  gastos: GastoDoc[];
  eliminando: string | null;
  onEliminar: (gasto: GastoDoc) => void;
};

export function TablaGastos({ gastos, eliminando, onEliminar }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-600">
            <th className="pb-2 pr-4 font-medium">Fecha</th>
            <th className="pb-2 pr-4 font-medium">Descripción</th>
            <th className="pb-2 pr-4 font-medium">Categoría</th>
            <th className="pb-2 pr-4 font-medium text-right">Importe</th>
            <th className="pb-2 pr-4 font-medium">Quién pagó</th>
            <th className="pb-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((gasto) => (
            <tr
              key={gasto.id}
              className="border-b border-neutral-100 hover:bg-neutral-50"
            >
              <td className="py-3 pr-4 text-neutral-700">{gasto.fecha}</td>
              <td className="py-3 pr-4 text-neutral-700">
                {gasto.descripcion || <span className="text-neutral-400">—</span>}
              </td>
              <td className="py-3 pr-4">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {gasto.categoria}
                </span>
              </td>
              <td className="py-3 pr-4 text-right font-medium text-neutral-800">
                {gasto.importe.toFixed(2)} €
              </td>
              <td className="py-3 pr-4 text-neutral-700">{gasto.pagadoPor}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/hogar/nuevo-gasto?id=${gasto.id}`}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => onEliminar(gasto)}
                    disabled={eliminando === gasto.id}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                  >
                    {eliminando === gasto.id ? "Borrando…" : "Borrar"}
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
