import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";
import { env } from "@/lib/env";

// Sitemap dinámico: rutas estáticas + productos activos + categorías.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
        take: 5000,
      }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);

    return [
      ...staticRoutes,
      ...categories.map((c) => ({
        url: `${base}/catalogo?category=${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...products.map((p) => ({
        url: `${base}/producto/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
