# Panel de control — Benito

> Estado del proyecto para seguimiento. Actualizado al último commit.
> PR de revisión: **https://github.com/raineribenicio-dotcom/benito/pull/1**
> Rama: `claude/test-coverage-analysis-ffefa4`

## Resumen

E-commerce multi-categoría (moda, electrónica, hogar, belleza, salud), mobile-first.
**Next.js 14 · TypeScript · Tailwind · PostgreSQL + Prisma · Stripe · Auth.js.**

- ✅ **42/42 tests** en verde (lógica de dominio).
- ✅ **Typecheck completo sin errores reales.**
- ⚠️ `prisma generate` / `next build` no ejecutables en el sandbox (egress bloquea
  los engines de Prisma) → se verifican al arrancar en local/Vercel.

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
| Carrito abandonado | ✅ | Cron + email + enlace de recuperación |
| i18n + multi-moneda (UI) | ✅ | Selector es/en + EUR/USD/GBP, precios convertidos |
| Wishlist + colecciones | ✅ | Favoritos y páginas de colección (navegación completa) |
| PayPal | ⏳ | Pendiente (requiere cuenta) |
| Stripe Subscriptions (cobro recurrente) | ⏳ | Pendiente (requiere cuenta) |

## Próximos pasos sugeridos

1. **Arrancar y verificar build** en local/Vercel (ver abajo).
2. Revisión de seguridad del diff (`/security-review`).
3. PayPal / Stripe Subscriptions real (cuando haya cuentas).

## Cómo arrancar

```bash
pnpm install
cp .env.example .env.local        # DATABASE_URL + AUTH_SECRET mínimos
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev                          # http://localhost:3000
```

Admin de ejemplo: `admin@benito.shop` / `admin1234`. Cupón demo: `BIENVENIDA10`.

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
