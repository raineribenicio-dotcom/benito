// Valoración en estrellas. Accesible: incluye texto para lectores de pantalla.

export function Stars({ rating, count }: { rating: number; count?: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Valoración ${rating} de 5`}>
      <span className="text-amber-500" aria-hidden="true">
        {"★".repeat(full)}
        <span className="text-gray-300">{"★".repeat(5 - full)}</span>
      </span>
      {count != null && <span className="text-xs text-gray-500">({count})</span>}
    </span>
  );
}
