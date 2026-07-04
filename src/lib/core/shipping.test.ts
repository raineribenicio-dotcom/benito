import { describe, expect, it } from "vitest";
import { computeShipping, shippingLabel, type ShippingRate } from "./shipping";

// Tarifa explícita para que el test no dependa de los valores por defecto.
const rate: ShippingRate = { amount: 500, label: "Envío estándar", freeThreshold: 5000 };

describe("computeShipping", () => {
  it("cobra tarifa plana por debajo del umbral", () => {
    expect(computeShipping({ subtotal: 1000 }, rate)).toBe(500);
  });

  it("envío gratis al alcanzar el umbral", () => {
    expect(computeShipping({ subtotal: 5000 }, rate)).toBe(0);
    expect(computeShipping({ subtotal: 9000 }, rate)).toBe(0);
  });

  it("etiqueta refleja la gratuidad", () => {
    expect(shippingLabel({ subtotal: 6000 }, rate)).toBe("Envío gratis");
    expect(shippingLabel({ subtotal: 1000 }, rate)).toContain("Envío estándar");
  });
});
