import { describe, expect, it } from "vitest";
import { crearGastoSchema } from "./gastos.schema";

describe("crearGastoSchema", () => {
  const datosValidos = {
    importe: 42.5,
    descripcion: "Supermercado",
    categoria: "Alimentación",
    fecha: "2024-11-20",
    pagadoPor: "Ana",
  };

  it("acepta datos válidos completos", () => {
    const result = crearGastoSchema.safeParse(datosValidos);
    expect(result.success).toBe(true);
  });

  it("acepta datos sin descripción (campo opcional)", () => {
    const { descripcion: _, ...sinDescripcion } = datosValidos;
    const result = crearGastoSchema.safeParse(sinDescripcion);
    expect(result.success).toBe(true);
  });

  it("rechaza importe cero", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, importe: 0 });
    expect(result.success).toBe(false);
  });

  it("rechaza importe negativo", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, importe: -10 });
    expect(result.success).toBe(false);
  });

  it("rechaza importe que no es número", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, importe: "cuarenta" });
    expect(result.success).toBe(false);
  });

  it("rechaza categoría vacía", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, categoria: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza categoría de solo espacios", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, categoria: "   " });
    expect(result.success).toBe(false);
  });

  it("rechaza pagadoPor vacío", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, pagadoPor: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza pagadoPor de solo espacios", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, pagadoPor: "  " });
    expect(result.success).toBe(false);
  });

  it("rechaza fecha con formato incorrecto", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, fecha: "20-11-2024" });
    expect(result.success).toBe(false);
  });

  it("rechaza fecha con solo texto", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, fecha: "hoy" });
    expect(result.success).toBe(false);
  });

  it("acepta fecha en formato YYYY-MM-DD", () => {
    const result = crearGastoSchema.safeParse({ ...datosValidos, fecha: "2024-01-01" });
    expect(result.success).toBe(true);
  });
});
