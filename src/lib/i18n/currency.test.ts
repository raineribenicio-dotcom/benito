import { describe, expect, it } from "vitest";
import { convert, isCurrency } from "./currency";

describe("convert", () => {
  it("no cambia si origen y destino son iguales", () => {
    expect(convert(1995, "EUR", "EUR")).toBe(1995);
  });

  it("convierte EUR a USD con la tasa", () => {
    expect(convert(1000, "EUR", "USD")).toBe(1080);
  });

  it("convierte USD a EUR (ida y vuelta aproximada)", () => {
    expect(convert(1080, "USD", "EUR")).toBe(1000);
  });

  it("redondea a céntimos", () => {
    expect(Number.isInteger(convert(1995, "EUR", "GBP"))).toBe(true);
  });
});

describe("isCurrency", () => {
  it("acepta monedas soportadas", () => {
    expect(isCurrency("EUR")).toBe(true);
    expect(isCurrency("USD")).toBe(true);
  });
  it("rechaza valores no soportados", () => {
    expect(isCurrency("JPY")).toBe(false);
    expect(isCurrency(undefined)).toBe(false);
  });
});
