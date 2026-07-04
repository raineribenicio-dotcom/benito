import { features } from "@/lib/env";
import { prisma } from "@/lib/db/client";

// Interfaz de búsqueda. Implementación Algolia si hay claves; si no, fallback a
// búsqueda full-text en Postgres. El resto de la app sólo conoce esta interfaz.

export type SearchHit = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  price: number; // céntimos (variante más barata)
  currency: string;
};

export interface SearchProvider {
  search(query: string, opts?: { limit?: number }): Promise<SearchHit[]>;
}

class PostgresSearch implements SearchProvider {
  async search(query: string, opts?: { limit?: number }): Promise<SearchHit[]> {
    const limit = opts?.limit ?? 12;
    if (!query.trim()) return [];

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        media: { orderBy: { position: "asc" }, take: 1 },
        variants: { orderBy: { priceAmount: "asc" }, take: 1 },
      },
    });

    return products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      imageUrl: p.media[0]?.url ?? null,
      price: p.variants[0]?.priceAmount ?? 0,
      currency: p.variants[0]?.currency ?? "EUR",
    }));
  }
}

// Placeholder de Algolia: misma interfaz. Se implementa cuando haya claves.
class AlgoliaSearch implements SearchProvider {
  async search(query: string, opts?: { limit?: number }): Promise<SearchHit[]> {
    // TODO: integrar algoliasearch cuando ALGOLIA_* esté configurado.
    // De momento delega en Postgres para no romper el flujo.
    return new PostgresSearch().search(query, opts);
  }
}

export const searchProvider: SearchProvider = features.algolia
  ? new AlgoliaSearch()
  : new PostgresSearch();
