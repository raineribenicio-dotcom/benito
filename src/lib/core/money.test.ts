import { describe, expect, it } from "vitest";
import { applyPercentage, formatMoney, formatPrice } from "./money";

describe("formatMoney", () => {
  it("formatea céntimos como euros", () => {
    expect(formatMoney(1995, "EUR", "es-ES")).toContain("19,95");
  });

  it("formatea dólares en en-US", () => {
    expect(formatMoney(8900, "USD", "en-US")).toBe("$89.00");
  });
});

describe("formatPrice", () => {
  it("convierte de la moneda base a la de display", () => {
    // 10,00 EUR -> USD (tasa 1.08) = 10,80 $
    expect(formatPrice(1000, "EUR", "USD", "en-US")).toBe("$10.80");
  });

  it("no convierte si base y destino coinciden", () => {
    expect(formatPrice(1995, "EUR", "EUR", "es-ES")).toContain("19,95");
  });
});

describe("applyPercentage", () => {
  it("calcula y redondea a céntimos", () => {
    expect(applyPercentage(1995, 21)).toBe(419); // 418.95 -> 419
  });

  it("0% devuelve 0", () => {
    expect(applyPercentage(1000, 0)).toBe(0);
  });
});
