"use client";

import { useEffect } from "react";

// Error boundary global (Next.js error.tsx). Captura errores en render de las
// rutas, evita la pantalla en blanco y ofrece reintentar.

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="text-5xl">😕</p>
      <h1 className="mt-4 text-2xl font-bold">Algo ha salido mal</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Ha ocurrido un error inesperado. Puedes reintentar o volver a la tienda.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Reintentar
        </button>
        <a
          href="/"
          className="rounded-full border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50"
        >
          Ir al inicio
        </a>
      </div>
    </main>
  );
}
