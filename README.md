# Nuvora

Plataforma de **e-commerce multi-categoría** (moda, electrónica, hogar, belleza, salud),
mobile-first y optimizada para conversión. Stack: **Next.js 14 (App Router) · TypeScript ·
Tailwind · PostgreSQL + Prisma · Stripe · Algolia**.

> Estado del proyecto y seguimiento en [`docs/PROGRESS.md`](docs/PROGRESS.md).
> Arquitectura y decisiones en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Arranque rápido

```bash
pnpm install
cp .env.example .env.local      # rellena al menos DATABASE_URL
pnpm db:generate                # genera el cliente Prisma
pnpm db:push                    # crea el esquema en tu PostgreSQL
pnpm db:seed                    # carga catálogo de ejemplo (5 categorías)
pnpm dev                        # http://localhost:3000
```

Las integraciones externas (Stripe, Algolia, Cloudinary, email) están **abstraídas tras
interfaces**: si no defines sus claves en `.env.local`, la app usa un fallback
(pago en stub, búsqueda en Postgres, imágenes directas, emails por consola), de modo que
puedes desarrollar sin cuentas.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `pnpm start` | Build y arranque de producción |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm typecheck` | Comprobación de tipos |
| `pnpm db:push` / `db:migrate` | Sincroniza el esquema con la base de datos |
| `pnpm db:seed` | Datos de ejemplo |
| `pnpm db:studio` | Prisma Studio |

## Despliegue

Pensado para **Vercel** + PostgreSQL gestionado (Neon, Supabase, RDS). Configura las
variables de `.env.example` en el proyecto de Vercel y ejecuta las migraciones en el
pipeline de despliegue.
