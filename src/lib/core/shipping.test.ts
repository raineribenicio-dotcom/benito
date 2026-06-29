import { describe, expect, it } from "vitest";
import { computeShipping, shippingLabel } from "./shipping";

describe("computeShipping", () => {
  it("cobra tarifa plana por debajo del umbral", () => {
    expect(computeShipping({ subtotal: 1000 })).toBe(499);
  });

  it("envío gratis al alcanzar el umbral", () => {
    expect(computeShipping({ subtotal: 4900 })).toBe(0);
    expect(computeShipping({ subtotal: 9000 })).toBe(0);
  });

  it("etiqueta refleja la gratuidad", () => {
    expect(shippingLabel({ subtotal: 5000 })).toBe("Envío gratis");
    expect(shippingLabel({ subtotal: 1000 })).toContain("Envío estándar");
  });
});
