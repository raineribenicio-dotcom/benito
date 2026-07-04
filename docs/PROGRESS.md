# Panel de control — Nuvora

> Estado del proyecto para seguimiento. Actualizado al último commit.
> PR de revisión: **https://github.com/raineribenicio-dotcom/benito/pull/1**
> Rama: `claude/test-coverage-analysis-ffefa4`

## Resumen

E-commerce multi-categoría (moda, electrónica, hogar, belleza, salud), mobile-first.
**Next.js 14 · TypeScript · Tailwind · PostgreSQL + Prisma · Stripe · Auth.js.**

- ✅ **57/57 tests** en verde (lógica de dominio).
- ✅ **Typecheck completo sin errores reales.**
- ✅ **Revisión de seguridad** realizada y hallazgos corregidos (token de pedido,
  escape JSON-LD, pasarelas en producción).
- ⚠️ `prisma generate` / `next build` se ejecutan al arrancar en local/Vercel
  (el sandbox de desarrollo bloqueaba la descarga de engines de Prisma).

## Funcionalidades

| Área | Estado | Detalle |
|---|---|---|
| Fundamentos (schema, dominio) | ✅ | Catálogo flexible, variantes, multi-moneda, i18n, suscripciones |
| Catálogo + producto + búsqueda | ✅ | Filtros, orden, paginación, ficha, reseñas, SEO schema.org |
| Carrito + checkout | ✅ | Persistente, envío/impuestos/cupones, checkout 1 paso |
| Pagos | ✅ | Stripe real (Elements + webhook firmado) con fallback stub; reembolsos |
| Cuenta + auth | ✅ | Auth.js, registro/login, direcciones, pedidos, devoluciones |
| Panel admin | ✅ | KPIs, CRUD, **import CSV**, pedidos, reembolsos, cupones, AuditLog |
| Crecimiento | ✅ | Emails, sitemap/robots, suscripciones |
| Pagos | ✅ | Multi-proveedor: **Stripe + PayPal** con selector; reembolsos por proveedor |
| Reseñas + Q&A | ✅ | Escribir reseñas (compra verificada), preguntas y respuestas |
| Carrito abandonado | ✅ | Cron + email + enlace de recuperación |
| Suscripciones + cobro recurrente | ✅ | Alta, gestión y cron de facturación recurrente |
| i18n + multi-moneda (UI) | ✅ | Selector es/en + EUR/USD/GBP, precios convertidos |
| Wishlist + colecciones | ✅ | Favoritos y páginas de colección |
| Mini-carrito + UX | ✅ | Drawer lateral, skeletons de carga, páginas de error/404 |
| Home | ✅ | Hero, barra de confianza, novedades, más vendidos |

## Para finalizar

1. **Merge** del PR a `main` (código listo).
2. **Desplegar** (Neon + Vercel) siguiendo `docs/DEPLOY.md` → URL pública.
3. **Claves reales** cuando quieras cobrar (Stripe/PayPal) — todo con fallback.

## Cómo arrancar

```bash
pnpm install
cp .env.example .env.local        # DATABASE_URL + AUTH_SECRET mínimos
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev                          # http://localhost:3000
```

Admin de ejemplo: `admin@nuvora.shop` / `admin1234`. Cupón demo: `BIENVENIDA10`.

## Qué claves pegar (resumen)

- **Obligatorias:** `DATABASE_URL` (Neon/Supabase), `AUTH_SECRET` (`openssl rand -base64 32`).
- **Cobrar de verdad:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Opcionales (con fallback):** Google OAuth, Algolia, Cloudinary, Resend (email), `CRON_SECRET`.

## Historial de commits

```
e8125a3 feat: lista de deseos y páginas de colección
befb948 feat: importación masiva de productos por CSV
487dfbd feat: i18n (es/en) y multi-moneda en la UI
79dfdee feat: recuperación de carrito abandonado
84d8a8a fix: tipado seguro de id/role en sesión de Auth.js
cb2f4a3 M7: Crecimiento — emails, SEO, suscripciones
61f5bf1 M4: Integración real de pagos con Stripe
8358daa M5: Cuenta y autenticación con Auth.js
0e7a841 M6: Panel de administración
f983344 M3: Carrito persistente y checkout de 1 paso
c73f8f9 M2: Catálogo, producto y búsqueda
c6ba533 M1: Fundamentos del ecommerce
```
