import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/core/catalog";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) return { title: "Colección no encontrada" };
  return { title: collection.title, description: collection.description ?? undefined };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const collection = await getCollectionBySlug(params.slug);
  if (!collection) notFound();

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <nav className="mb-4 text-sm text-gray-500" aria-label="Migas de pan">
          <a href="/" className="hover:text-brand-600">Inicio</a>
          {" / "}
          <span className="text-gray-700">{collection.title}</span>
        </nav>

        <h1 className="text-2xl font-bold">{collection.title}</h1>
        {collection.description && <p className="mt-2 text-gray-600">{collection.description}</p>}

        {collection.products.length === 0 ? (
          <p className="mt-6 text-gray-500">Esta colección aún no tiene productos.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {collection.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
