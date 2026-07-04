// Agregado de valoración (media + conteo). Puro y testeable; se usa al crear o
// moderar reseñas para actualizar el producto.

export function computeRatingAggregate(ratings: number[]): { average: number; count: number } {
  const count = ratings.length;
  if (count === 0) return { average: 0, count: 0 };
  const sum = ratings.reduce((s, r) => s + r, 0);
  // Media redondeada a 1 decimal
  return { average: Math.round((sum / count) * 10) / 10, count };
}
