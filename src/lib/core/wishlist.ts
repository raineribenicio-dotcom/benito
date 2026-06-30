import { prisma } from "@/lib/db/client";

// Lista de deseos. Una por usuario (se crea al primer uso). El toggle añade o
// quita una variante y devuelve el nuevo estado.

export async function toggleWishlist(
  userId: string,
  variantId: string,
): Promise<{ inWishlist: boolean }> {
  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_variantId: { wishlistId: wishlist.id, variantId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { inWishlist: false };
  }

  await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, variantId } });
  return { inWishlist: true };
}

export async function getWishlist(userId: string) {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: { include: { media: { orderBy: { position: "asc" }, take: 1 } } },
                stockLevels: true,
              },
            },
          },
        },
      },
    });
    return wishlist?.items ?? [];
  } catch {
    return [];
  }
}

export async function getWishlistVariantIds(userId: string): Promise<Set<string>> {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { wishlist: { userId } },
      select: { variantId: true },
    });
    return new Set(items.map((i) => i.variantId));
  } catch {
    return new Set();
  }
}
