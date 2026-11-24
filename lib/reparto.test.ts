import { describe, expect, it } from "vitest";
import { calcularReparto, calcularTransferencias } from "./reparto";

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

describe("calcularTransferencias", () => {
  it("devuelve array vacío con balance vacío (sin gastos)", () => {
    expect(calcularTransferencias({})).toEqual([]);
  });

  it("devuelve array vacío cuando todos tienen balance cero (ya saldado)", () => {
    expect(calcularTransferencias({ ana: 0, bruno: 0, carla: 0 })).toEqual([]);
  });

  it("caso simple: A pagó todo, B y C deben su parte", () => {
    const balance = { ana: -20, bruno: 10, carla: 10 };
    const transferencias = calcularTransferencias(balance);
    expect(transferencias).toHaveLength(2);
    const total = transferencias.reduce((s, t) => s + t.importe, 0);
    expect(Math.round(total * 100) / 100).toBe(20);
    for (const t of transferencias) {
      expect(t.a).toBe("ana");
    }
  });

  it("caso complejo: varios pagadores con distintos importes", () => {
    // ana pagó 100, bruno pagó 50, carla 0, david 0 → total 150, parte 37.5
    // balance: ana -62.5, bruno -12.5, carla +37.5, david +37.5 (suma 0)
    const balance = { ana: -62.5, bruno: -12.5, carla: 37.5, david: 37.5 };
    const transferencias = calcularTransferencias(balance);
    const totalDeuda = transferencias.reduce((s, t) => s + t.importe, 0);
    expect(Math.round(totalDeuda * 100) / 100).toBe(75);
    for (const t of transferencias) {
      expect(["de", "a"].every((k) => k in t)).toBe(true);
      expect(t.importe).toBeGreaterThan(0);
    }
  });

  it("el número de transferencias es mínimo (≤ N-1 para N miembros con deuda)", () => {
    const balance = { ana: -30, bruno: 10, carla: 10, david: 10 };
    const transferencias = calcularTransferencias(balance);
    expect(transferencias.length).toBeLessThanOrEqual(3);
    const total = transferencias.reduce((s, t) => s + t.importe, 0);
    expect(Math.round(total * 100) / 100).toBe(30);
  });
});
