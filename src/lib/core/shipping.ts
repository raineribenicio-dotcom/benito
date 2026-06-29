// Cálculo de envío. Regla por defecto: envío gratis a partir de un umbral, si no
// tarifa plana. Función pura y testeable; las tarifas se podrán mover a DB/admin.

export type ShippingInput = {
  subtotal: number; // céntimos (tras descuentos de producto)
  country?: string;
};

export type ShippingRate = {
  amount: number; // céntimos
  label: string;
  freeThreshold: number;
};

const DEFAULT_RATE: ShippingRate = {
  amount: 499,
  label: "Envío estándar (24-48h)",
  freeThreshold: 4900, // gratis a partir de 49 €
};

export function computeShipping(input: ShippingInput, rate: ShippingRate = DEFAULT_RATE): number {
  if (input.subtotal >= rate.freeThreshold) return 0;
  return rate.amount;
}

export function shippingLabel(input: ShippingInput, rate: ShippingRate = DEFAULT_RATE): string {
  return computeShipping(input, rate) === 0 ? "Envío gratis" : rate.label;
}
