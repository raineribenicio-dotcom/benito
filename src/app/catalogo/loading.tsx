import { Skeleton, ProductGridSkeleton } from "@/components/Skeleton";

// Estado de carga del catálogo (Next.js loading.tsx): se muestra al instante
// mientras se resuelven los datos, mejorando la percepción de velocidad.

export default function CatalogLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-8 w-40" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-32" />
          ))}
        </div>
        <div>
          <Skeleton className="mb-4 h-4 w-24" />
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
