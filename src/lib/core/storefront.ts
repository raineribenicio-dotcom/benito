import { prisma } from "@/lib/db/client";

// Lecturas de cara a la tienda. Tolerantes a fallos para que la app renderice
// aunque la base de datos no esté disponible todavía (primer arranque).

export type HomeProduct = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  price: number;
  currency: string;
};

export async function getHomeData() {
  try {
    const [featuredCollections, products] = await Promise.all([
      prisma.collection.findMany({
        where: { isFeatured: true },
        orderBy: { position: "asc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { ratingCount: "desc" },
        take: 8,
        include: {
          media: { orderBy: { position: "asc" }, take: 1 },
          variants: { orderBy: { priceAmount: "asc" }, take: 1 },
        },
      }),
    ]);

    const bestSellers: HomeProduct[] = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      imageUrl: p.media[0]?.url ?? null,
      price: p.variants[0]?.priceAmount ?? 0,
      currency: p.variants[0]?.currency ?? "EUR",
    }));

    return { featuredCollections, bestSellers };
  } catch (err) {
    console.warn("[storefront] DB no disponible, renderizando vacío:", (err as Error).message);
    return { featuredCollections: [], bestSellers: [] };
  }
}
