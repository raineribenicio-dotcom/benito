"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/session";
import { toggleWishlist } from "@/lib/core/wishlist";

// Quitar de favoritos desde la página /wishlist (toggle sobre un item presente).

export async function removeFromWishlistAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autenticado");
  const variantId = z.string().min(1).parse(formData.get("variantId"));
  await toggleWishlist(userId, variantId);
  revalidatePath("/wishlist");
}
