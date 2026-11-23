import { type GastoDoc } from "@/lib/gastos";

/**
 * Extrae los meses únicos presentes en la lista de gastos.
 * Devuelve un array de strings "YYYY-MM" ordenados descendentemente.
 */
export function extraerMeses(gastos: GastoDoc[]): string[] {
  const set = new Set<string>();
  for (const g of gastos) {
    const mes = g.fecha.slice(0, 7); // "YYYY-MM"
    set.add(mes);
  }
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

/**
 * Filtra una lista de gastos por categoría y/o mes.
 * Pasar "todas" o "" para no filtrar por ese eje.
 */
export function filtrarGastos(
  gastos: GastoDoc[],
  categoria: string,
  mes: string
): GastoDoc[] {
  return gastos.filter((g) => {
    const coincideCategoria =
      !categoria || categoria === "todas" || g.categoria === categoria;
    const coincideMes =
      !mes || mes === "todos" || g.fecha.startsWith(mes);
    return coincideCategoria && coincideMes;
  });
}

/**
 * Formatea un string "YYYY-MM" a texto legible como "noviembre 2026".
 */
export function formatearMes(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-");
  if (!year || !month) return yyyyMM;
  const fecha = new Date(Number(year), Number(month) - 1, 1);
  return fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}
