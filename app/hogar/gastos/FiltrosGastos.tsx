"use client";

import { formatearMes } from "@/lib/filtros-gastos";

type Props = {
  categorias: string[];
  meses: string[];
  filtroCat: string;
  filtroMes: string;
  onCambiaCat: (v: string) => void;
  onCambiaMes: (v: string) => void;
};

export function FiltrosGastos({
  categorias,
  meses,
  filtroCat,
  filtroMes,
  onCambiaCat,
  onCambiaMes,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label htmlFor="filtro-categoria" className="block text-sm font-medium text-neutral-700">
          Categoría
        </label>
        <select
          id="filtro-categoria"
          value={filtroCat}
          onChange={(e) => onCambiaCat(e.target.value)}
          className="mt-1 rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-mes" className="block text-sm font-medium text-neutral-700">
          Mes
        </label>
        <select
          id="filtro-mes"
          value={filtroMes}
          onChange={(e) => onCambiaMes(e.target.value)}
          className="mt-1 rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {meses.map((m) => (
            <option key={m} value={m}>
              {formatearMes(m)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
