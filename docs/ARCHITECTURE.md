# Arquitectura — Benito

Plataforma de e-commerce multi-categoría (moda, electrónica, hogar, belleza, salud),
mobile-first, estándar Shopify. Este documento describe las decisiones tomadas y la
hoja de ruta por módulos.

## Decisiones clave (hito 1)

| Decisión | Elección | Motivo |
|---|---|---|
| Backend | **Next.js full-stack** (Server Actions + Route Handlers) | Menos infraestructura, deploy directo en Vercel, máximo SSR. |
| Integraciones externas | **Abstraídas tras interfaces con fallback** | Desarrollar sin cuentas de Stripe/Algolia/Cloudinary. |
| Estructura | **App única bien modularizada** (extraíble a monorepo) | Arrancar rápido y verificable; el dominio ya está desacoplado. |

## Estructura de carpetas

```
benito/
├─ prisma/
│  ├─ schema.prisma      # Modelo de datos completo
│  └─ seed.ts            # Datos de ejemplo (5 categorías, variantes, ficha técnica)
├─ src/
│  ├─ app/               # Rutas (App Router): tienda + (futuro) /admin
│  │  ├─ layout.tsx
│  │  ├─ page.tsx        # Home dinámica
│  │  └─ globals.css
│  └─ lib/
│     ├─ env.ts          # Validación de entorno (Zod) + feature flags
│     ├─ db/             # Cliente Prisma (singleton)
│     ├─ core/           # Dominio puro: money, pricing, storefront
│     ├─ payments/       # Interfaz de pagos (Stripe | stub)
│     ├─ search/         # Interfaz de búsqueda (Algolia | Postgres)
│     └─ email/          # (próximo) plantillas transaccionales
└─ docs/
```

## Capas

1. **Dominio** (`lib/core`) — funciones puras, testeables, sin dependencias de Next ni DB
   (p.ej. `computeTotals`). Cubierto por tests unitarios.
2. **Datos** (`lib/db` + Prisma) — única puerta a PostgreSQL.
3. **Integraciones** (`lib/payments`, `lib/search`, `lib/email`) — cada proveedor
   detrás de una interfaz; la ausencia de claves activa un fallback.
4. **Presentación** (`app/`) — Server Components por defecto; Client Components sólo
   donde hay interacción.

## Modelo de datos — claves de diseño

- **Catálogo flexible:** `Category` (árbol) + `AttributeDefinition` por categoría +
  `ProductAttributeValue` tipado + `Product.attributes` (JSONB) para filtrado rápido.
  Así una categoría nueva no requiere cambios de esquema.
- **Variantes estilo Shopify:** `Product` → `ProductOption`/`ProductOptionValue` →
  `ProductVariant` ↔ `VariantOptionValue`. Stock por `StockLevel`/`Location`.
- **Dinero:** enteros en céntimos + ISO currency. Multi-moneda vía `VariantPrice`.
- **i18n:** tablas `*Translation` (producto, categoría) por `locale`.
- **Snapshots en pedidos:** `OrderItem` guarda título/precio/SKU para conservar el
  histórico aunque cambie el catálogo.
- **CRO:** `Review` (con fotos y compra verificada), `Question`/`Answer`, `Wishlist`,
  recuperación de carrito (`Cart.remindedAt`), `Subscription` para recompra.

## Hoja de ruta por módulos

- [x] **M1 — Fundamentos:** scaffold, schema Prisma, dominio + tests, home, seed.
- [x] **M2 — Catálogo:** listado con filtros/orden, página de producto, búsqueda.
- [x] **M3 — Carrito y checkout:** carrito persistente (cookie invitado), checkout
      1 paso, envío/impuestos/cupones, creación de pedido y reserva de stock.
- [x] **M4 — Pagos:** Stripe real (PaymentIntent + Stripe Elements en el checkout
      + webhook firmado que confirma el pedido). Sin claves => proveedor stub.
      PayPal pendiente.
- [x] **M5 — Cuenta:** Auth.js (Credentials + Google opcional), registro/login,
      direcciones, historial de pedidos, devoluciones self-service, merge de
      carrito de invitado al iniciar sesión.
- [x] **M6 — Admin:** dashboard KPIs, CRUD productos, gestión de pedidos
      (estados + reembolsos parciales), cupones, con guard de rol y AuditLog.
- [ ] **M7 — Crecimiento:** suscripciones, emails, i18n/multi-moneda, SEO/schema.org.

## Pagos (Stripe)

Flujo según haya o no claves (`STRIPE_SECRET_KEY`):

- **Sin claves (stub):** el checkout usa un formulario con Server Action; el pago
  se simula como `succeeded`, el pedido pasa a `PAID` y el carrito se vacía. Útil
  para desarrollo end-to-end.
- **Con claves (real):** el checkout monta **Stripe Elements**. Paso 1 (dirección)
  → `POST /api/checkout/intent` crea el pedido `PENDING` + `PaymentIntent` y
  devuelve el `clientSecret`. Paso 2 → el cliente confirma el pago (tarjeta,
  Apple Pay, Google Pay). El pedido se marca `PAID` y el carrito se vacía **solo**
  cuando llega `payment_intent.succeeded` al webhook firmado.

Webhook: configura un endpoint en Stripe a `/api/stripe/webhook` y pega el
`whsec_...` en `STRIPE_WEBHOOK_SECRET`. En local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

La firma se verifica siempre sobre el cuerpo crudo; nunca se confía en el payload
sin verificar.

## Setup

```bash
pnpm install
cp .env.example .env.local      # rellena DATABASE_URL como mínimo
pnpm db:generate
pnpm db:push                    # o db:migrate para histórico de migraciones
pnpm db:seed
pnpm dev
```

## Tests

```bash
pnpm test        # Vitest — dominio (pricing, money…)
```
