import { prisma } from "@/lib/db/client";

// Lecturas del área de cliente.

export async function getUserOrders(userId: string) {
  try {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true, returns: true, shipments: true },
    });
  } catch {
    return [];
  }
}

export async function getUserAddresses(userId: string) {
  try {
    return await prisma.address.findMany({ where: { userId }, orderBy: { isDefault: "desc" } });
  } catch {
    return [];
  }
}
