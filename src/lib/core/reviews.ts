import { prisma } from "@/lib/db/client";
import { computeRatingAggregate } from "./rating";

// Reseñas: verifica compra, evita duplicados y recalcula el agregado del producto.

async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  const count = await prisma.orderItem.count({
    where: {
      order: { userId, status: { in: ["PAID", "FULFILLING", "SHIPPED", "DELIVERED"] } },
      variant: { productId },
    },
  });
  return count > 0;
}

async function recomputeRating(productId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    select: { rating: true },
  });
  const { average, count } = computeRatingAggregate(reviews.map((r) => r.rating));
  await prisma.product.update({
    where: { id: productId },
    data: { ratingAverage: average, ratingCount: count },
  });
}

export async function createReview(params: {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  body?: string;
}): Promise<{ ok: boolean; message: string }> {
  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId: params.productId, userId: params.userId } },
  });
  if (existing) return { ok: false, message: "Ya has reseñado este producto" };

  const verified = await hasPurchased(params.userId, params.productId);

  await prisma.review.create({
    data: {
      productId: params.productId,
      userId: params.userId,
      rating: Math.max(1, Math.min(5, params.rating)),
      title: params.title,
      body: params.body,
      isVerified: verified,
      isApproved: true, // auto-aprobada; el admin puede moderar cambiando el flag
    },
  });

  await recomputeRating(params.productId);
  return { ok: true, message: "¡Gracias por tu reseña!" };
}
