import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/core/catalog";
import { SiteHeader } from "@/components/SiteHeader";
import { Stars } from "@/components/Stars";
import { ProductPurchase, type VariantVM } from "@/components/ProductPurchase";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { ReviewForm } from "@/components/ReviewForm";
import { getCurrentUserId } from "@/lib/auth/session";
import { submitQuestionAction } from "@/lib/actions/reviews";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.metaTitle ?? product.title,
    description: product.metaDescription ?? product.description ?? undefined,
    openGraph: {
      title: product.title,
      images: product.media[0]?.url ? [product.media[0].url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const { related, boughtTogether } = await getRelatedProducts(product.id);
  const userId = await getCurrentUserId();

  const cheapest = product.variants.reduce(
    (min, v) => (v.priceAmount < min ? v.priceAmount : min),
    product.variants[0]?.priceAmount ?? 0,
  );
  const currency = product.variants[0]?.currency ?? "EUR";

  const options = product.options.map((o) => ({
    name: o.name,
    values: o.values.map((v) => v.value),
  }));

  const variants: VariantVM[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.priceAmount,
    compareAt: v.compareAt,
    currency: v.currency,
    available: v.stockLevels.reduce((sum, s) => sum + s.available, 0),
    optionValues: Object.fromEntries(
      v.optionValues.map((ov) => [
        // recuperamos el nombre de la opción a partir del valor
        product.options.find((o) => o.values.some((val) => val.id === ov.optionValue.id))?.name ?? "",
        ov.optionValue.value,
      ]),
    ),
  }));

  // Datos estructurados schema.org (SEO técnico del brief)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.media.map((m) => m.url),
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAverage,
            reviewCount: product.ratingCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: (cheapest / 100).toFixed(2),
      priceCurrency: currency,
      availability:
        variants.some((v) => v.available > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-gray-500" aria-label="Migas de pan">
          <a href="/" className="hover:text-brand-600">Inicio</a>
          {" / "}
          <a href="/catalogo" className="hover:text-brand-600">Catálogo</a>
          {" / "}
          <span className="text-gray-700">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Galería interactiva */}
          <ProductGallery
            title={product.title}
            images={product.media.map((m) => ({ id: m.id, url: m.url, alt: m.alt }))}
          />

          {/* Compra */}
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{product.title}</h1>
            {product.ratingCount > 0 && (
              <div className="mt-2">
                <Stars rating={product.ratingAverage} count={product.ratingCount} />
              </div>
            )}
            {product.description && <p className="mt-4 text-gray-600">{product.description}</p>}

            <div className="mt-6">
              <ProductPurchase options={options} variants={variants} />
            </div>

            {/* Ficha técnica (atributos flexibles por categoría) */}
            {product.attributeValues.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold">Ficha técnica</h2>
                <dl className="mt-2 divide-y divide-gray-100 text-sm">
                  {product.attributeValues.map((a) => (
                    <div key={a.id} className="flex justify-between py-1.5">
                      <dt className="text-gray-500">{a.key}</dt>
                      <dd className="font-medium">
                        {a.valueString ?? a.valueNumber ?? (a.valueBool ? "Sí" : "No")} {a.unit}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Reseñas con fotos (prueba social, CRO) */}
        <section className="mt-12">
          <h2 className="text-xl font-bold">Reseñas</h2>
          {product.reviews.length === 0 ? (
            <p className="mt-2 text-gray-500">Aún no hay reseñas. ¡Sé el primero!</p>
          ) : (
            <ul className="mt-4 space-y-6">
              {product.reviews.map((r) => (
                <li key={r.id} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-sm font-medium">{r.user.name ?? "Cliente"}</span>
                    {r.isVerified && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                        Compra verificada
                      </span>
                    )}
                  </div>
                  {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                  {r.body && <p className="mt-1 text-sm text-gray-600">{r.body}</p>}
                  {r.media.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {r.media.map((m) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={m.id} src={m.url} alt={m.alt ?? ""} className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Escribir reseña */}
          {userId ? (
            <ReviewForm productId={product.id} slug={product.slug} />
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              <a href="/login" className="text-brand-600 hover:underline">Inicia sesión</a> para dejar una reseña.
            </p>
          )}
        </section>

        {/* Preguntas y respuestas */}
        <section className="mt-12">
          <h2 className="text-xl font-bold">Preguntas y respuestas</h2>
          {product.questions.length === 0 ? (
            <p className="mt-2 text-gray-500">Aún no hay preguntas.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {product.questions.map((q) => (
                <li key={q.id} className="border-b border-gray-100 pb-4">
                  <p className="font-medium">P: {q.body}</p>
                  <p className="text-xs text-gray-400">{q.user.name ?? "Cliente"}</p>
                  {q.answers.map((a) => (
                    <p key={a.id} className="mt-2 pl-4 text-sm text-gray-700">
                      R: {a.body}{" "}
                      {a.isStaff && <span className="text-xs text-brand-600">(equipo)</span>}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}

          {userId ? (
            <form action={submitQuestionAction} className="mt-4 flex gap-2">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="slug" value={product.slug} />
              <input
                name="body"
                required
                minLength={5}
                maxLength={500}
                placeholder="Haz una pregunta sobre este producto…"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Preguntar
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              <a href="/login" className="text-brand-600 hover:underline">Inicia sesión</a> para preguntar.
            </p>
          )}
        </section>

        {/* Comprados juntos (cross-sell) */}
        {boughtTogether.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold">Comprados juntos</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {boughtTogether.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Productos relacionados */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold">También te puede gustar</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
