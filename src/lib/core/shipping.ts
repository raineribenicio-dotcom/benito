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
  amount: 599900, // $5.999 (céntimos ARS)
  label: "Envío estándar (24-72h)",
  freeThreshold: 5000000, // gratis a partir de $50.000
};

export function computeShipping(input: ShippingInput, rate: ShippingRate = DEFAULT_RATE): number {
  if (input.subtotal >= rate.freeThreshold) return 0;
  return rate.amount;
}

export function shippingLabel(input: ShippingInput, rate: ShippingRate = DEFAULT_RATE): string {
  return computeShipping(input, rate) === 0 ? "Envío gratis" : rate.label;
}
