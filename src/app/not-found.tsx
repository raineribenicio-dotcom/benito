import { SiteHeader } from "@/components/SiteHeader";

// Página 404 global (Next.js not-found.tsx).

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <p className="text-6xl font-bold text-brand-500/40">404</p>
        <h1 className="mt-4 text-2xl font-bold">Página no encontrada</h1>
        <p className="mt-2 max-w-md text-gray-600">
          El enlace no existe o el producto ya no está disponible.
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="/catalogo"
            className="rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Explorar catálogo
          </a>
          <a
            href="/"
            className="rounded-full border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50"
          >
            Ir al inicio
          </a>
        </div>
      </main>
    </>
  );
}
