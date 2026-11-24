export type Gasto = {
  importe: number;
  pagadoPor: string;
};

export type Transferencia = { de: string; a: string; importe: number };

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

/**
 * Dado el balance por persona (positivo = debe, negativo = le deben),
 * calcula las transferencias mínimas necesarias para saldarlo todo.
 * Algoritmo greedy: empareja el mayor deudor con el mayor acreedor en cada paso.
 * Produce a lo sumo N-1 transferencias para N miembros.
 */
export function calcularTransferencias(balance: Record<string, number>): Transferencia[] {
  const transferencias: Transferencia[] = [];

  const EPSILON = 0.005;

  const deudores: { nombre: string; importe: number }[] = [];
  const acreedores: { nombre: string; importe: number }[] = [];

  for (const [nombre, importe] of Object.entries(balance)) {
    if (importe > EPSILON) {
      deudores.push({ nombre, importe });
    } else if (importe < -EPSILON) {
      acreedores.push({ nombre, importe: -importe });
    }
  }

  deudores.sort((a, b) => b.importe - a.importe);
  acreedores.sort((a, b) => b.importe - a.importe);

  let i = 0;
  let j = 0;
  while (i < deudores.length && j < acreedores.length) {
    const deudor = deudores[i];
    const acreedor = acreedores[j];

    if (!deudor || !acreedor) break;

    const pago = Math.min(deudor.importe, acreedor.importe);
    const pagoRedondeado = Math.round(pago * 100) / 100;

    if (pagoRedondeado > 0) {
      transferencias.push({
        de: deudor.nombre,
        a: acreedor.nombre,
        importe: pagoRedondeado,
      });
    }

    deudor.importe -= pago;
    acreedor.importe -= pago;

    if (deudor.importe < EPSILON) i++;
    if (acreedor.importe < EPSILON) j++;
  }

  return transferencias;
}
