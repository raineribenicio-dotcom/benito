import { prisma } from "@/lib/db/client";
import type { CatalogProduct } from "./catalog";

// Lecturas de cara a la tienda. Tolerantes a fallos para que la app renderice
// aunque la base de datos no esté disponible todavía (primer arranque).

function toCard(p: {
  id: string;
  slug: string;
  title: string;
  ratingAverage: number;
  ratingCount: number;
  media: { url: string }[];
  variants: { priceAmount: number; compareAt: number | null; currency: string }[];
}): CatalogProduct {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    imageUrl: p.media[0]?.url ?? null,
    price: p.variants[0]?.priceAmount ?? 0,
    compareAt: p.variants[0]?.compareAt ?? null,
    currency: p.variants[0]?.currency ?? "EUR",
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
  };
}

export async function getHomeData(): Promise<{
  featuredCollections: { id: string; slug: string; title: string }[];
  bestSellers: CatalogProduct[];
  newArrivals: CatalogProduct[];
}> {
  const include = {
    media: { orderBy: { position: "asc" as const }, take: 1 },
    variants: { orderBy: { priceAmount: "asc" as const }, take: 1 },
  };

  try {
    const [featuredCollections, best, fresh] = await Promise.all([
      prisma.collection.findMany({ where: { isFeatured: true }, orderBy: { position: "asc" }, take: 8 }),
      prisma.product.findMany({ where: { status: "ACTIVE" }, orderBy: { ratingCount: "desc" }, take: 8, include }),
      prisma.product.findMany({
        where: { status: "ACTIVE", publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include,
      }),
    ]);

    return {
      featuredCollections,
      bestSellers: best.map(toCard),
      newArrivals: fresh.map(toCard),
    };
  } catch (err) {
    console.warn("[storefront] DB no disponible, renderizando vacío:", (err as Error).message);
    return { featuredCollections: [], bestSellers: [], newArrivals: [] };
  }
}
