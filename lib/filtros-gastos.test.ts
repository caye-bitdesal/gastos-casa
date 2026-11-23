import { describe, expect, it } from "vitest";
import { extraerMeses, filtrarGastos, formatearMes } from "./filtros-gastos";
import { type GastoDoc } from "./gastos";

const gastos: GastoDoc[] = [
  {
    id: "1",
    importe: 50,
    descripcion: "Supermercado",
    categoria: "Alimentación",
    fecha: "2026-11-10",
    pagadoPor: "Ana",
    creadoEn: null,
  },
  {
    id: "2",
    importe: 30,
    descripcion: "Cinema",
    categoria: "Ocio",
    fecha: "2026-11-05",
    pagadoPor: "Luis",
    creadoEn: null,
  },
  {
    id: "3",
    importe: 100,
    descripcion: "Luz",
    categoria: "Suministros",
    fecha: "2026-10-20",
    pagadoPor: "Ana",
    creadoEn: null,
  },
  {
    id: "4",
    importe: 20,
    descripcion: "Pan",
    categoria: "Alimentación",
    fecha: "2026-10-15",
    pagadoPor: "Luis",
    creadoEn: null,
  },
];

describe("extraerMeses", () => {
  it("extrae los meses únicos en orden descendente", () => {
    const meses = extraerMeses(gastos);
    expect(meses).toEqual(["2026-11", "2026-10"]);
  });

  it("devuelve array vacío si no hay gastos", () => {
    expect(extraerMeses([])).toEqual([]);
  });

  it("no duplica meses", () => {
    const meses = extraerMeses(gastos);
    expect(meses.length).toBe(2);
  });
});

describe("filtrarGastos", () => {
  it("sin filtros devuelve todos los gastos", () => {
    expect(filtrarGastos(gastos, "", "")).toHaveLength(4);
  });

  it("filtra por categoría", () => {
    const resultado = filtrarGastos(gastos, "Alimentación", "");
    expect(resultado).toHaveLength(2);
    expect(resultado.every((g) => g.categoria === "Alimentación")).toBe(true);
  });

  it("filtra por mes", () => {
    const resultado = filtrarGastos(gastos, "", "2026-11");
    expect(resultado).toHaveLength(2);
    expect(resultado.every((g) => g.fecha.startsWith("2026-11"))).toBe(true);
  });

  it("combina filtro de categoría y mes", () => {
    const resultado = filtrarGastos(gastos, "Alimentación", "2026-10");
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.id).toBe("4");
  });

  it("devuelve vacío cuando no hay coincidencias", () => {
    const resultado = filtrarGastos(gastos, "Viajes", "2026-11");
    expect(resultado).toHaveLength(0);
  });

  it("'todas' como categoría devuelve todos", () => {
    const resultado = filtrarGastos(gastos, "todas", "");
    expect(resultado).toHaveLength(4);
  });

  it("'todos' como mes devuelve todos", () => {
    const resultado = filtrarGastos(gastos, "", "todos");
    expect(resultado).toHaveLength(4);
  });
});

describe("formatearMes", () => {
  it("formatea YYYY-MM a texto legible", () => {
    const texto = formatearMes("2026-11");
    expect(texto).toContain("noviembre");
    expect(texto).toContain("2026");
  });

  it("devuelve la cadena original si el formato es inválido", () => {
    expect(formatearMes("invalido")).toBe("invalido");
  });
});
