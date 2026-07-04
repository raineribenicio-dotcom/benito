"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addItem, updateItemQty, removeItem, applyCoupon } from "@/lib/core/cart";

// Server Actions para mutar el carrito desde formularios (progressive enhancement).

export async function updateItemAction(formData: FormData) {
  const schema = z.object({ itemId: z.string().min(1), quantity: z.coerce.number().int().min(0).max(99) });
  const { itemId, quantity } = schema.parse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
  });
  await updateItemQty(itemId, quantity);
  revalidatePath("/carrito");
}

export async function removeItemAction(formData: FormData) {
  const itemId = z.string().min(1).parse(formData.get("itemId"));
  await removeItem(itemId);
  revalidatePath("/carrito");
}

export async function applyCouponAction(formData: FormData) {
  const code = z.string().min(1).max(40).parse(formData.get("code"));
  await applyCoupon(code);
  revalidatePath("/carrito");
}

export async function addItemAction(variantId: string, quantity: number) {
  await addItem(variantId, quantity);
  revalidatePath("/carrito");
}
