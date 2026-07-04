import { applyPercentage } from "./money";

// Cálculo de totales de carrito/pedido. Función pura y testeable: no toca DB.

export type LineItem = {
  unitPrice: number; // céntimos
  quantity: number;
};

export type DiscountInput =
  | { type: "PERCENTAGE"; value: number; minSubtotal?: number }
  | { type: "FIXED_AMOUNT"; value: number; minSubtotal?: number }
  | { type: "FREE_SHIPPING"; value?: number; minSubtotal?: number };

export type PricingInput = {
  items: LineItem[];
  discount?: DiscountInput | null;
  shippingAmount?: number;
  taxRate?: number; // p.ej. 0.21 para 21% IVA
};

export type PricingResult = {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
};

export function computeTotals(input: PricingInput): PricingResult {
  const { items, discount, shippingAmount = 0, taxRate = 0 } = input;

  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  let discountTotal = 0;
  let shippingTotal = shippingAmount;

  if (discount && (discount.minSubtotal ?? 0) <= subtotal) {
    switch (discount.type) {
      case "PERCENTAGE":
        discountTotal = applyPercentage(subtotal, discount.value);
        break;
      case "FIXED_AMOUNT":
        discountTotal = Math.min(discount.value, subtotal);
        break;
      case "FREE_SHIPPING":
        shippingTotal = 0;
        break;
    }
  }

  const taxableBase = Math.max(0, subtotal - discountTotal);
  const taxTotal = Math.round(taxableBase * taxRate);
  const total = taxableBase + shippingTotal + taxTotal;

  return { subtotal, discountTotal, shippingTotal, taxTotal, total };
}
