"use client";

import { useState } from "react";
import { submitReviewAction } from "@/lib/actions/reviews";

// Formulario de reseña con selección de estrellas. Progressive enhancement:
// funciona como POST a la Server Action; el estado de estrellas es cliente.

export function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  return (
    <form action={submitReviewAction} className="mt-4 rounded-xl border border-gray-200 p-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-sm font-medium">Tu valoración</p>
      <div className="mt-1 flex gap-1 text-2xl" role="radiogroup" aria-label="Valoración">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} estrellas`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={(hover || rating) >= n ? "text-amber-500" : "text-gray-300"}
          >
            ★
          </button>
        ))}
      </div>

      <input
        name="title"
        placeholder="Título (opcional)"
        maxLength={120}
        className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <textarea
        name="body"
        rows={3}
        placeholder="Cuéntanos tu experiencia (opcional)"
        maxLength={2000}
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="mt-3 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Publicar reseña
      </button>
    </form>
  );
}
