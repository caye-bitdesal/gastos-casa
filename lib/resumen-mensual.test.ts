import { describe, expect, it } from "vitest";
import {
  filtrarGastosMes,
  calcularResumenMes,
  calcularComparativa,
  type GastoResumen,
} from "./resumen-mensual";

const gastos: GastoResumen[] = [
  { importe: 50, categoria: "alimentación", fecha: "2026-11-01", pagadoPor: "Ana" },
  { importe: 30, categoria: "transporte", fecha: "2026-11-15", pagadoPor: "Bruno" },
  { importe: 20, categoria: "alimentación", fecha: "2026-11-20", pagadoPor: "Ana" },
  { importe: 100, categoria: "ocio", fecha: "2026-10-05", pagadoPor: "Ana" },
];

describe("filtrarGastosMes", () => {
  it("devuelve solo los gastos del mes indicado", () => {
    const resultado = filtrarGastosMes(gastos, 2026, 11);
    expect(resultado).toHaveLength(3);
  });

  it("devuelve array vacío si no hay gastos ese mes", () => {
    const resultado = filtrarGastosMes(gastos, 2026, 9);
    expect(resultado).toHaveLength(0);
  });

  it("distingue correctamente entre meses distintos del mismo año", () => {
    const resultado = filtrarGastosMes(gastos, 2026, 10);
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.categoria).toBe("ocio");
  });
});

describe("calcularResumenMes", () => {
  it("devuelve total 0 y arrays vacíos para lista vacía", () => {
    const resumen = calcularResumenMes([]);
    expect(resumen.total).toBe(0);
    expect(resumen.porCategoria).toHaveLength(0);
    expect(resumen.porMiembro).toHaveLength(0);
  });

  it("calcula el total correcto para varios gastos", () => {
    const mesGastos = filtrarGastosMes(gastos, 2026, 11);
    const resumen = calcularResumenMes(mesGastos);
    expect(resumen.total).toBe(100);
  });

  it("desglosa correctamente por categoría con porcentajes", () => {
    const mesGastos = filtrarGastosMes(gastos, 2026, 11);
    const resumen = calcularResumenMes(mesGastos);
    const alimentacion = resumen.porCategoria.find((c) => c.categoria === "alimentación");
    expect(alimentacion?.importe).toBe(70);
    expect(alimentacion?.porcentaje).toBe(70);
    const transporte = resumen.porCategoria.find((c) => c.categoria === "transporte");
    expect(transporte?.importe).toBe(30);
    expect(transporte?.porcentaje).toBe(30);
  });

  it("desglosa correctamente el reparto por miembro", () => {
    const mesGastos = filtrarGastosMes(gastos, 2026, 11);
    const resumen = calcularResumenMes(mesGastos);
    const ana = resumen.porMiembro.find((m) => m.nombre === "Ana");
    expect(ana?.importe).toBe(70);
    const bruno = resumen.porMiembro.find((m) => m.nombre === "Bruno");
    expect(bruno?.importe).toBe(30);
  });

  it("un único gasto ocupa el 100% de su categoría", () => {
    const single: GastoResumen[] = [
      { importe: 45, categoria: "servicios", fecha: "2026-11-05", pagadoPor: "Ana" },
    ];
    const resumen = calcularResumenMes(single);
    expect(resumen.total).toBe(45);
    expect(resumen.porCategoria[0]?.porcentaje).toBe(100);
  });
});

describe("calcularComparativa", () => {
  it("calcula diferencia y porcentaje correctamente cuando ambos tienen gastos", () => {
    const comp = calcularComparativa(120, 100);
    expect(comp.diferencia).toBe(20);
    expect(comp.porcentaje).toBe(20);
  });

  it("retorna porcentaje null cuando el mes anterior no tiene gastos", () => {
    const comp = calcularComparativa(50, 0);
    expect(comp.diferencia).toBe(50);
    expect(comp.porcentaje).toBeNull();
  });

  it("mes actual vacío y anterior con gastos da diferencia negativa", () => {
    const comp = calcularComparativa(0, 100);
    expect(comp.diferencia).toBe(-100);
    expect(comp.porcentaje).toBe(-100);
  });

  it("diferencia negativa cuando se gasta menos que el mes anterior", () => {
    const comp = calcularComparativa(80, 100);
    expect(comp.diferencia).toBe(-20);
    expect(comp.porcentaje).toBe(-20);
  });

  it("ambos a cero devuelve diferencia 0 y porcentaje null", () => {
    const comp = calcularComparativa(0, 0);
    expect(comp.diferencia).toBe(0);
    expect(comp.porcentaje).toBeNull();
  });
});
