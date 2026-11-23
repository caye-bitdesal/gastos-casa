import { describe, expect, it } from "vitest";
import { crearHogarSchema } from "./hogares.schema";

describe("crearHogarSchema", () => {
  it("acepta un nombre válido", () => {
    const result = crearHogarSchema.safeParse({ nombre: "Casa Familiar" });
    expect(result.success).toBe(true);
  });

  it("acepta un nombre con espacios laterales (lo recorta)", () => {
    const result = crearHogarSchema.safeParse({ nombre: "  Mi Casa  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nombre).toBe("Mi Casa");
    }
  });

  it("rechaza una cadena vacía", () => {
    const result = crearHogarSchema.safeParse({ nombre: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza una cadena de solo espacios", () => {
    const result = crearHogarSchema.safeParse({ nombre: "   " });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando falta el campo nombre", () => {
    const result = crearHogarSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
