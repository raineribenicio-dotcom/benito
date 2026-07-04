import { describe, expect, it } from "vitest";
import { computeTotals } from "./pricing";

describe("computeTotals", () => {
  it("suma el subtotal de las líneas", () => {
    const r = computeTotals({
      items: [
        { unitPrice: 1000, quantity: 2 },
        { unitPrice: 500, quantity: 1 },
      ],
    });
    expect(r.subtotal).toBe(2500);
    expect(r.total).toBe(2500);
  });

  it("aplica descuento porcentual sobre el subtotal", () => {
    const r = computeTotals({
      items: [{ unitPrice: 1000, quantity: 1 }],
      discount: { type: "PERCENTAGE", value: 10 },
    });
    expect(r.discountTotal).toBe(100);
    expect(r.total).toBe(900);
  });

  it("respeta el umbral mínimo del descuento", () => {
    const r = computeTotals({
      items: [{ unitPrice: 1000, quantity: 1 }],
      discount: { type: "FIXED_AMOUNT", value: 500, minSubtotal: 2000 },
    });
    expect(r.discountTotal).toBe(0);
  });

  it("FREE_SHIPPING anula el envío", () => {
    const r = computeTotals({
      items: [{ unitPrice: 1000, quantity: 1 }],
      shippingAmount: 400,
      discount: { type: "FREE_SHIPPING" },
    });
    expect(r.shippingTotal).toBe(0);
    expect(r.total).toBe(1000);
  });

  it("calcula impuestos sobre la base ya descontada", () => {
    const r = computeTotals({
      items: [{ unitPrice: 10000, quantity: 1 }],
      discount: { type: "PERCENTAGE", value: 50 },
      taxRate: 0.21,
    });
    expect(r.discountTotal).toBe(5000);
    expect(r.taxTotal).toBe(1050); // 21% de 5000
    expect(r.total).toBe(6050);
  });

  it("el descuento fijo no supera el subtotal", () => {
    const r = computeTotals({
      items: [{ unitPrice: 300, quantity: 1 }],
      discount: { type: "FIXED_AMOUNT", value: 500 },
    });
    expect(r.discountTotal).toBe(300);
    expect(r.total).toBe(0);
  });
});
