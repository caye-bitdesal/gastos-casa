export type GastoResumen = {
  importe: number;
  categoria: string;
  fecha: string; // "YYYY-MM-DD"
  pagadoPor: string;
};

export type ResumenMes = {
  total: number;
  porCategoria: { categoria: string; importe: number; porcentaje: number }[];
  porMiembro: { nombre: string; importe: number }[];
};

export type Comparativa = {
  diferencia: number;
  porcentaje: number | null;
};

/**
 * Filtra los gastos que pertenecen al año y mes indicados (mes 1-based).
 */
export function filtrarGastosMes(
  gastos: GastoResumen[],
  anyo: number,
  mes: number
): GastoResumen[] {
  const mesStr = String(mes).padStart(2, "0");
  const prefix = `${anyo}-${mesStr}`;
  return gastos.filter((g) => g.fecha.startsWith(prefix));
}

/**
 * Calcula el resumen de gastos de un mes: total, desglose por categoría y por miembro.
 * Si la lista está vacía devuelve total 0 y arrays vacíos.
 */
export function calcularResumenMes(gastos: GastoResumen[]): ResumenMes {
  if (gastos.length === 0) {
    return { total: 0, porCategoria: [], porMiembro: [] };
  }

  const total = gastos.reduce((sum, g) => sum + g.importe, 0);

  const catMap = new Map<string, number>();
  for (const g of gastos) {
    catMap.set(g.categoria, (catMap.get(g.categoria) ?? 0) + g.importe);
  }
  const porCategoria = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, importe]) => ({
      categoria,
      importe: Math.round(importe * 100) / 100,
      porcentaje: total > 0 ? Math.round((importe / total) * 1000) / 10 : 0,
    }));

  const miembroMap = new Map<string, number>();
  for (const g of gastos) {
    miembroMap.set(g.pagadoPor, (miembroMap.get(g.pagadoPor) ?? 0) + g.importe);
  }
  const porMiembro = Array.from(miembroMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, importe]) => ({
      nombre,
      importe: Math.round(importe * 100) / 100,
    }));

  return { total: Math.round(total * 100) / 100, porCategoria, porMiembro };
}

/**
 * Calcula la diferencia en € y en % entre el mes actual y el anterior.
 * porcentaje es null cuando totalAnterior es 0 (no hay base de comparación).
 */
export function calcularComparativa(
  totalActual: number,
  totalAnterior: number
): Comparativa {
  const diferencia = Math.round((totalActual - totalAnterior) * 100) / 100;
  const porcentaje =
    totalAnterior > 0
      ? Math.round(((totalActual - totalAnterior) / totalAnterior) * 1000) / 10
      : null;
  return { diferencia, porcentaje };
}
