import { PrismaClient, ProductStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

// Catálogo de ejemplo para una tienda argentina: precios en ARS (céntimos =
// pesos × 100), imágenes reales (Unsplash) y reseñas redactadas por clientes de
// ejemplo. Idempotente: se puede reejecutar (upserts por claves únicas).

const ars = (pesos: number) => Math.round(pesos * 100);
const IMG = (id: string) => `https://images.unsplash.com/${id}?w=800&q=75&auto=format&fit=crop`;

type Seed = {
  slug: string;
  title: string;
  description: string;
  category: string;
  price: number; // pesos
  compareAt?: number; // pesos
  stock: number;
  image: string;
  rating: number; // media mostrada (se recalcula con reseñas reales)
  ratingCount: number;
  attributes?: Record<string, unknown>;
};

const PRODUCTS: Seed[] = [
  // Moda
  { slug: "camiseta-algodon-organico", title: "Camiseta de algodón orgánico", description: "Suave, transpirable y sostenible. Corte unisex, ideal para el día a día.", category: "moda", price: 18900, compareAt: 24900, stock: 60, image: IMG("photo-1521572163474-6864f9cf17ab"), rating: 4.6, ratingCount: 0 },
  { slug: "zapatillas-urbanas", title: "Zapatillas urbanas", description: "Livianas y con plantilla acolchada. Perfectas para caminar todo el día.", category: "moda", price: 89900, compareAt: 109900, stock: 35, image: IMG("photo-1542291026-7eec264c27ff"), rating: 4.7, ratingCount: 0 },
  { slug: "campera-de-jean", title: "Campera de jean clásica", description: "Denim resistente con lavado vintage. Un básico atemporal.", category: "moda", price: 65000, stock: 20, image: IMG("photo-1516257984-b1b4d707412e"), rating: 4.5, ratingCount: 0 },

  // Electrónica
  { slug: "auriculares-inalambricos-pro", title: "Auriculares inalámbricos Pro", description: "Cancelación de ruido, 30 h de batería y Bluetooth 5.3.", category: "electronica", price: 189000, compareAt: 249000, stock: 80, image: IMG("photo-1505740420928-5e560c06d30e"), rating: 4.8, ratingCount: 0, attributes: { bluetooth: "5.3", bateria_horas: 30, anc: true } },
  { slug: "smartwatch-fit", title: "Smartwatch Fit", description: "Ritmo cardíaco, GPS y notificaciones. Resistente al agua.", category: "electronica", price: 145000, compareAt: 179000, stock: 45, image: IMG("photo-1523275335684-37898b6baf30"), rating: 4.6, ratingCount: 0, attributes: { pantalla: "AMOLED", resistencia: "5 ATM", gps: true } },
  { slug: "parlante-bluetooth", title: "Parlante Bluetooth portátil", description: "Sonido potente, 20 h de batería y resistente a salpicaduras.", category: "electronica", price: 72000, stock: 55, image: IMG("photo-1608043152269-423dbba4e7e1"), rating: 4.4, ratingCount: 0 },

  // Hogar
  { slug: "lampara-nordica", title: "Lámpara nórdica de mesa", description: "Diseño escandinavo en madera y lino. Luz cálida y regulable.", category: "hogar", price: 34900, stock: 40, image: IMG("photo-1507473885765-e6ed057f782c"), rating: 4.5, ratingCount: 0 },
  { slug: "juego-sabanas-premium", title: "Juego de sábanas premium", description: "Algodón 400 hilos, suavidad de hotel. Queen size.", category: "hogar", price: 58000, compareAt: 72000, stock: 30, image: IMG("photo-1584100936595-c0654b55a2e6"), rating: 4.7, ratingCount: 0 },

  // Belleza
  { slug: "serum-facial-vitamina-c", title: "Sérum facial con vitamina C", description: "Ilumina y unifica el tono. Con ácido hialurónico.", category: "belleza", price: 24500, compareAt: 29900, stock: 90, image: IMG("photo-1620916566398-39f1143ab7be"), rating: 4.7, ratingCount: 0 },
  { slug: "set-brochas-maquillaje", title: "Set de brochas de maquillaje", description: "12 brochas ultrasuaves con estuche. Cerdas sintéticas veganas.", category: "belleza", price: 19900, stock: 50, image: IMG("photo-1596462502278-27bfdc403348"), rating: 4.5, ratingCount: 0 },

  // Salud y bienestar
  { slug: "botella-termica-1l", title: "Botella térmica 1 L", description: "Acero inoxidable, mantiene frío 24 h y caliente 12 h.", category: "salud", price: 22000, stock: 70, image: IMG("photo-1602143407151-7111542de6e8"), rating: 4.6, ratingCount: 0 },
  { slug: "bandas-elasticas", title: "Bandas elásticas de entrenamiento", description: "Set de 5 resistencias para entrenar en casa. Incluye bolso.", category: "salud", price: 15900, compareAt: 19900, stock: 65, image: IMG("photo-1598289431512-b97b0917affc"), rating: 4.4, ratingCount: 0 },
];

// Reseñas de ejemplo (redactadas). Se reparten entre clientes de ejemplo.
const REVIEW_POOL = [
  { rating: 5, title: "Excelente calidad", body: "Superó mis expectativas. La calidad se nota apenas lo abrís. Llegó rápido y bien embalado." },
  { rating: 5, title: "Lo recomiendo 100%", body: "Muy buena compra, tal cual la descripción. Volvería a comprar sin dudarlo." },
  { rating: 4, title: "Muy bueno", body: "Cumple perfecto con lo que buscaba. Le pongo 4 porque el envío tardó un día más de lo previsto." },
  { rating: 5, title: "Hermoso", body: "Me encantó, se ve incluso mejor que en las fotos. Relación precio-calidad inmejorable." },
  { rating: 4, title: "Buena relación precio/calidad", body: "Anda muy bien por el precio que tiene. Contento con la compra." },
  { rating: 5, title: "Todo perfecto", body: "Atención de diez y el producto impecable. Ya es mi segunda compra en la tienda." },
];

async function main() {
  console.log("🌱 Seeding (tienda ARS)…");

  await prisma.user.upsert({
    where: { email: "admin@nuvora.shop" },
    update: {},
    create: { email: "admin@nuvora.shop", name: "Admin", role: "ADMIN", emailVerified: new Date(), currency: "ARS", passwordHash: await hashPassword("admin1234") },
  });

  const warehouse = await prisma.location.upsert({
    where: { id: "loc_main" },
    update: {},
    create: { id: "loc_main", name: "Depósito central", country: "AR" },
  });

  // Categorías
  const categories = [
    { slug: "moda", name: "Moda y accesorios" },
    { slug: "electronica", name: "Electrónica y gadgets" },
    { slug: "hogar", name: "Hogar y decoración" },
    { slug: "belleza", name: "Belleza y cuidado personal" },
    { slug: "salud", name: "Salud y bienestar" },
  ];
  const cat: Record<string, string> = {};
  for (const c of categories) {
    const created = await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
    cat[c.slug] = created.id;
  }

  await prisma.attributeDefinition.upsert({
    where: { categoryId_key: { categoryId: cat.electronica, key: "bateria_horas" } },
    update: {},
    create: { categoryId: cat.electronica, key: "bateria_horas", label: "Batería (horas)", type: "NUMBER", unit: "h", filterable: true },
  });

  // Clientes de ejemplo (para reseñas)
  const demoUsers = [
    { email: "ana@demo.com", name: "Ana G." },
    { email: "lucas@demo.com", name: "Lucas M." },
    { email: "sofia@demo.com", name: "Sofía R." },
    { email: "martin@demo.com", name: "Martín P." },
  ];
  const userIds: string[] = [];
  const pass = await hashPassword("demo1234");
  for (const u of demoUsers) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, emailVerified: new Date(), currency: "ARS", passwordHash: pass },
    });
    userIds.push(created.id);
  }

  // Productos + variante + media + categoría + reseñas
  const bySlug: Record<string, string> = {};
  let reviewCursor = 0;

  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { title: p.title, description: p.description, status: ProductStatus.ACTIVE, attributes: p.attributes ?? {}, publishedAt: new Date() },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        status: ProductStatus.ACTIVE,
        attributes: p.attributes ?? {},
        publishedAt: new Date(),
        categories: { create: [{ categoryId: cat[p.category] }] },
      },
    });
    bySlug[p.slug] = product.id;

    await prisma.media.upsert({
      where: { id: `media_${p.slug}` },
      update: { url: p.image, productId: product.id },
      create: { id: `media_${p.slug}`, url: p.image, alt: p.title, position: 0, productId: product.id },
    });

    const sku = p.slug.toUpperCase().slice(0, 20);
    const variant = await prisma.productVariant.upsert({
      where: { sku },
      update: { priceAmount: ars(p.price), compareAt: p.compareAt ? ars(p.compareAt) : null, currency: "ARS" },
      create: { productId: product.id, sku, priceAmount: ars(p.price), compareAt: p.compareAt ? ars(p.compareAt) : null, currency: "ARS" },
    });
    await prisma.stockLevel.upsert({
      where: { variantId_locationId: { variantId: variant.id, locationId: warehouse.id } },
      update: { available: p.stock },
      create: { variantId: variant.id, locationId: warehouse.id, available: p.stock },
    });

    // 2-3 reseñas por producto, de clientes distintos
    const nReviews = 2 + (reviewCursor % 2);
    const ratings: number[] = [];
    for (let i = 0; i < nReviews; i++) {
      const userId = userIds[(reviewCursor + i) % userIds.length];
      const r = REVIEW_POOL[(reviewCursor + i) % REVIEW_POOL.length];
      ratings.push(r.rating);
      await prisma.review.upsert({
        where: { productId_userId: { productId: product.id, userId } },
        update: {},
        create: { productId: product.id, userId, rating: r.rating, title: r.title, body: r.body, isApproved: true, isVerified: true },
      });
    }
    const avg = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
    await prisma.product.update({ where: { id: product.id }, data: { ratingAverage: avg, ratingCount: ratings.length } });
    reviewCursor += nReviews;
  }

  // Colecciones destacadas para la home
  await prisma.collection.upsert({
    where: { slug: "novedades" },
    update: {},
    create: {
      slug: "novedades", title: "Novedades", isFeatured: true, position: 0,
      products: { create: [{ productId: bySlug["zapatillas-urbanas"] }, { productId: bySlug["smartwatch-fit"] }, { productId: bySlug["serum-facial-vitamina-c"] }] },
    },
  });
  await prisma.collection.upsert({
    where: { slug: "mas-vendidos" },
    update: {},
    create: {
      slug: "mas-vendidos", title: "Más vendidos", isFeatured: true, position: 1,
      products: { create: [{ productId: bySlug["auriculares-inalambricos-pro"] }, { productId: bySlug["camiseta-algodon-organico"] }] },
    },
  });

  // Relacionados y "comprados juntos"
  const rel: [string, string, "related" | "bought_together"][] = [
    ["auriculares-inalambricos-pro", "smartwatch-fit", "related"],
    ["auriculares-inalambricos-pro", "parlante-bluetooth", "bought_together"],
    ["camiseta-algodon-organico", "zapatillas-urbanas", "related"],
    ["serum-facial-vitamina-c", "set-brochas-maquillaje", "bought_together"],
  ];
  for (const [from, to, kind] of rel) {
    await prisma.relatedProduct.upsert({
      where: { fromId_toId_kind: { fromId: bySlug[from], toId: bySlug[to], kind } },
      update: {},
      create: { fromId: bySlug[from], toId: bySlug[to], kind },
    });
  }

  // Cupón de bienvenida: 10%
  await prisma.discount.upsert({
    where: { code: "BIENVENIDA10" },
    update: {},
    create: { code: "BIENVENIDA10", type: "PERCENTAGE", value: 10, isActive: true },
  });

  console.log(`✅ Seed completado: ${PRODUCTS.length} productos, ${demoUsers.length} clientes y reseñas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
