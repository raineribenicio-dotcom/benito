import { PrismaClient, ProductStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

// Datos de ejemplo que cubren las 5 categorías estrella del brief, con variantes
// (talla/color en moda), atributos flexibles (ficha técnica en electrónica) y
// una colección destacada para la home.

async function main() {
  console.log("🌱 Seeding…");

  // Usuario administrador de ejemplo (admin@nuvora.shop / admin1234)
  await prisma.user.upsert({
    where: { email: "admin@nuvora.shop" },
    update: {},
    create: {
      email: "admin@nuvora.shop",
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      passwordHash: await hashPassword("admin1234"),
    },
  });

  const warehouse = await prisma.location.upsert({
    where: { id: "loc_main" },
    update: {},
    create: { id: "loc_main", name: "Almacén central", country: "ES" },
  });

  const categories = [
    { slug: "moda", name: "Moda y accesorios" },
    { slug: "electronica", name: "Electrónica y gadgets" },
    { slug: "hogar", name: "Hogar y decoración" },
    { slug: "belleza", name: "Belleza y cuidado personal" },
    { slug: "salud", name: "Salud y bienestar" },
  ];

  const cat: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    cat[c.slug] = created.id;
  }

  // Atributos flexibles por categoría (lo que diferencia electrónica de moda)
  await prisma.attributeDefinition.upsert({
    where: { categoryId_key: { categoryId: cat.electronica, key: "ram" } },
    update: {},
    create: { categoryId: cat.electronica, key: "ram", label: "RAM", type: "NUMBER", unit: "GB", filterable: true },
  });

  // Producto de moda con variantes talla/color
  const tshirt = await prisma.product.upsert({
    where: { slug: "camiseta-organica" },
    update: {},
    create: {
      slug: "camiseta-organica",
      title: "Camiseta de algodón orgánico",
      description: "Suave, transpirable y sostenible. Corte unisex.",
      status: ProductStatus.ACTIVE,
      ratingAverage: 4.6,
      ratingCount: 128,
      publishedAt: new Date(),
      categories: { create: [{ categoryId: cat.moda }] },
      options: {
        create: [
          { name: "Talla", position: 0, values: { create: [{ value: "S" }, { value: "M" }, { value: "L" }] } },
          { name: "Color", position: 1, values: { create: [{ value: "Negro" }, { value: "Blanco" }] } },
        ],
      },
    },
  });

  // Variante base (en producción se generan todas las combinaciones)
  await prisma.productVariant.upsert({
    where: { sku: "TSHIRT-M-NEGRO" },
    update: {},
    create: {
      productId: tshirt.id,
      sku: "TSHIRT-M-NEGRO",
      priceAmount: 1995,
      compareAt: 2495,
      currency: "EUR",
      weightGrams: 180,
      stockLevels: { create: [{ locationId: warehouse.id, available: 50 }] },
    },
  });

  // Producto de electrónica con ficha técnica
  const earbuds = await prisma.product.upsert({
    where: { slug: "auriculares-pro" },
    update: {},
    create: {
      slug: "auriculares-pro",
      title: "Auriculares inalámbricos Pro",
      description: "Cancelación de ruido, 30h de batería, Bluetooth 5.3.",
      status: ProductStatus.ACTIVE,
      ratingAverage: 4.8,
      ratingCount: 342,
      publishedAt: new Date(),
      attributes: { bluetooth: "5.3", battery_hours: 30, anc: true },
      categories: { create: [{ categoryId: cat.electronica }] },
    },
  });
  await prisma.productVariant.upsert({
    where: { sku: "EARBUDS-PRO" },
    update: {},
    create: {
      productId: earbuds.id,
      sku: "EARBUDS-PRO",
      priceAmount: 8900,
      compareAt: 11900,
      currency: "EUR",
      stockLevels: { create: [{ locationId: warehouse.id, available: 120 }] },
    },
  });

  // Colección destacada para la home
  await prisma.collection.upsert({
    where: { slug: "novedades" },
    update: {},
    create: {
      slug: "novedades",
      title: "Novedades",
      isFeatured: true,
      position: 0,
      products: { create: [{ productId: tshirt.id }, { productId: earbuds.id }] },
    },
  });

  // Cupón de ejemplo: 10% de descuento
  await prisma.discount.upsert({
    where: { code: "BIENVENIDA10" },
    update: {},
    create: { code: "BIENVENIDA10", type: "PERCENTAGE", value: 10, isActive: true },
  });

  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
