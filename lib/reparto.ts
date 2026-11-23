import { z } from "zod";

export const gastoSchema = z.object({
  importe: z.number().positive("El importe debe ser mayor que cero"),
  pagadoPor: z.string().min(1),
});

export type Gasto = z.infer<typeof gastoSchema>;

/**
 * Dado un conjunto de gastos y la lista de miembros del hogar, calcula
 * cuánto debe (o le deben) cada miembro para que el gasto total quede
 * repartido a partes iguales.
 * Positivo = ese miembro debe dinero al grupo. Negativo = le deben a él.
 */
export function calcularReparto(gastos: Gasto[], miembros: string[]): Record<string, number> {
  if (miembros.length === 0) return {};

  const total = gastos.reduce((suma, g) => suma + g.importe, 0);
  const partePorMiembro = total / miembros.length;

  const pagadoPorMiembro: Record<string, number> = Object.fromEntries(
    miembros.map((m) => [m, 0])
  );
  for (const g of gastos) {
    pagadoPorMiembro[g.pagadoPor] = (pagadoPorMiembro[g.pagadoPor] ?? 0) + g.importe;
  }

  const balance: Record<string, number> = {};
  for (const m of miembros) {
    // Redondeo a 2 decimales para evitar arrastrar errores de coma flotante.
    balance[m] = Math.round((partePorMiembro - (pagadoPorMiembro[m] ?? 0)) * 100) / 100;
  }
  return balance;
}
