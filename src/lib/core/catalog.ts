import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

// Lecturas del catálogo para la tienda: listado con filtros/orden y detalle.
// Tolerante a fallos para no romper el render si la DB no está disponible.

export type CatalogFilters = {
  category?: string; // slug
  brand?: string; // slug
  minPrice?: number; // céntimos
  maxPrice?: number; // céntimos
  minRating?: number;
  inStock?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  perPage?: number;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  price: number;
  compareAt: number | null;
  currency: string;
  ratingAverage: number;
  ratingCount: number;
};

export type CatalogResult = {
  products: CatalogProduct[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
};

function orderByFor(sort: CatalogFilters["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "newest":
      return { publishedAt: "desc" };
    case "rating":
      return { ratingAverage: "desc" };
    // price_asc/desc se resuelven en memoria sobre la variante más barata
    default:
      return { ratingCount: "desc" };
  }
}

export async function getCatalog(filters: CatalogFilters = {}): Promise<CatalogResult> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(60, filters.perPage ?? 24);

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(filters.category && { categories: { some: { category: { slug: filters.category } } } }),
    ...(filters.brand && { brand: { slug: filters.brand } }),
    ...(filters.minRating && { ratingAverage: { gte: filters.minRating } }),
    ...((filters.minPrice != null || filters.maxPrice != null) && {
      variants: {
        some: {
          priceAmount: {
            ...(filters.minPrice != null && { gte: filters.minPrice }),
            ...(filters.maxPrice != null && { lte: filters.maxPrice }),
          },
        },
      },
    }),
    ...(filters.inStock && {
      variants: { some: { stockLevels: { some: { available: { gt: 0 } } } } },
    }),
  };

  try {
    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: orderByFor(filters.sort),
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          media: { orderBy: { position: "asc" }, take: 1 },
          variants: { orderBy: { priceAmount: "asc" }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    let products: CatalogProduct[] = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      imageUrl: p.media[0]?.url ?? null,
      price: p.variants[0]?.priceAmount ?? 0,
      compareAt: p.variants[0]?.compareAt ?? null,
      currency: p.variants[0]?.currency ?? "EUR",
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
    }));

    if (filters.sort === "price_asc") products.sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc") products.sort((a, b) => b.price - a.price);

    return { products, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
  } catch (err) {
    console.warn("[catalog] DB no disponible:", (err as Error).message);
    return { products: [], total: 0, page, perPage, pages: 1 };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        media: { orderBy: { position: "asc" } },
        categories: { include: { category: true } },
        options: { include: { values: { orderBy: { position: "asc" } } }, orderBy: { position: "asc" } },
        variants: {
          include: {
            optionValues: { include: { optionValue: true } },
            stockLevels: true,
          },
          orderBy: { position: "asc" },
        },
        attributeValues: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } }, media: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        relatedTo: { include: { from: true } },
      },
    });
  } catch (err) {
    console.warn("[catalog] DB no disponible:", (err as Error).message);
    return null;
  }
}

export async function getCollectionBySlug(slug: string): Promise<{
  title: string;
  description: string | null;
  products: CatalogProduct[];
} | null> {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { position: "asc" },
          include: {
            product: {
              include: {
                media: { orderBy: { position: "asc" }, take: 1 },
                variants: { orderBy: { priceAmount: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!collection) return null;

    const products: CatalogProduct[] = collection.products
      .filter((cp) => cp.product.status === "ACTIVE")
      .map((cp) => ({
        id: cp.product.id,
        slug: cp.product.slug,
        title: cp.product.title,
        imageUrl: cp.product.media[0]?.url ?? null,
        price: cp.product.variants[0]?.priceAmount ?? 0,
        compareAt: cp.product.variants[0]?.compareAt ?? null,
        currency: cp.product.variants[0]?.currency ?? "EUR",
        ratingAverage: cp.product.ratingAverage,
        ratingCount: cp.product.ratingCount,
      }));

    return { title: collection.title, description: collection.description, products };
  } catch {
    return null;
  }
}

export async function getFilterFacets() {
  try {
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ orderBy: { position: "asc" } }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { categories, brands };
  } catch {
    return { categories: [], brands: [] };
  }
}
