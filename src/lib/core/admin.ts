import { prisma } from "@/lib/db/client";

// Lecturas del panel de administración: KPIs del dashboard y listados.
// Tolerantes a fallos para renderizar el panel aunque la DB no esté lista.

export type DashboardKpis = {
  revenue: number; // céntimos (pedidos pagados)
  orders: number;
  avgOrderValue: number;
  conversionRate: number; // pedidos / carritos creados
  abandonedCarts: number;
  topProducts: { title: string; units: number }[];
};

export async function getDashboardKpis(): Promise<DashboardKpis> {
  try {
    const [paid, cartsTotal, abandoned, topRows] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "FULFILLING", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.cart.count(),
      prisma.cart.count({ where: { status: "ABANDONED" } }),
      prisma.orderItem.groupBy({
        by: ["title"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const revenue = paid._sum.total ?? 0;
    const orders = paid._count;
    const convertedCarts = await prisma.cart.count({ where: { status: "CONVERTED" } });

    return {
      revenue,
      orders,
      avgOrderValue: orders > 0 ? Math.round(revenue / orders) : 0,
      conversionRate: cartsTotal > 0 ? convertedCarts / cartsTotal : 0,
      abandonedCarts: abandoned,
      topProducts: topRows.map((r) => ({ title: r.title, units: r._sum.quantity ?? 0 })),
    };
  } catch (err) {
    console.warn("[admin] DB no disponible:", (err as Error).message);
    return { revenue: 0, orders: 0, avgOrderValue: 0, conversionRate: 0, abandonedCarts: 0, topProducts: [] };
  }
}

export async function listAdminProducts(query?: string) {
  try {
    return await prisma.product.findMany({
      where: query ? { title: { contains: query, mode: "insensitive" } } : undefined,
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        variants: { select: { priceAmount: true, currency: true, stockLevels: true } },
        categories: { include: { category: { select: { name: true } } } },
      },
    });
  } catch {
    return [];
  }
}

export async function listAdminOrders() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { items: { select: { id: true } } },
    });
  } catch {
    return [];
  }
}

export async function getAdminOrder(id: string) {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, shipments: true },
    });
  } catch {
    return null;
  }
}

export async function listCoupons() {
  try {
    return await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export async function listCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { position: "asc" } });
  } catch {
    return [];
  }
}
