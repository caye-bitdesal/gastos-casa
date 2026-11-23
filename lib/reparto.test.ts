import { describe, expect, it } from "vitest";
import { calcularReparto } from "./reparto";

describe("calcularReparto", () => {
  it("reparte a partes iguales entre los miembros", () => {
    const balance = calcularReparto(
      [
        { importe: 60, pagadoPor: "ana" },
        { importe: 30, pagadoPor: "bruno" },
      ],
      ["ana", "bruno", "carla"]
    );
    // total 90 / 3 = 30 cada uno
    expect(balance.ana).toBe(-30); // pagó 60, le corresponden 30 → le deben 30
    expect(balance.bruno).toBe(0); // pagó 30, le corresponden 30 → en paz
    expect(balance.carla).toBe(30); // no pagó nada, debe 30
  });

  it("devuelve un objeto vacío si no hay miembros", () => {
    expect(calcularReparto([{ importe: 10, pagadoPor: "ana" }], [])).toEqual({});
  });

  it("no revienta con gastos de un miembro que pagó varias veces", () => {
    const balance = calcularReparto(
      [
        { importe: 10, pagadoPor: "ana" },
        { importe: 10, pagadoPor: "ana" },
      ],
      ["ana", "bruno"]
    );
    expect(balance.ana).toBe(-10);
    expect(balance.bruno).toBe(10);
  });
});
