# Desplegar Nuvora (URL pública en ~10 min)

Objetivo: tener `https://nuvora-xxx.vercel.app` que abres y navegas desde móvil u
ordenador. Necesitas dos cuentas gratuitas: **Neon** (base de datos) y **Vercel**
(hosting). Ambas tienen plan gratis suficiente para empezar.

## 1. Base de datos — Neon (2 min)

1. Entra en https://neon.tech y crea una cuenta.
2. **Create project** → nombre "nuvora", región cercana (p. ej. Frankfurt).
3. Copia la **Connection string** que te muestra (empieza por
   `postgresql://...neon.tech/...`). La usarás como `DATABASE_URL`.

## 2. Genera el secreto de sesión (10 seg)

En tu terminal:

```bash
openssl rand -base64 32
```

Guarda el resultado: será `AUTH_SECRET`.

## 3. Desplegar — Vercel (5 min)

1. Entra en https://vercel.com y regístrate con tu cuenta de GitHub.
2. **Add New → Project → Import** el repo `raineribenicio-dotcom/benito`.
3. Framework: detecta **Next.js** automáticamente. No cambies nada del build.
4. Despliega en **Environment Variables** (mínimo imprescindible):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | la connection string de Neon |
   | `AUTH_SECRET` | el valor de `openssl rand` |
   | `AUTH_URL` | `https://TU-PROYECTO.vercel.app` (lo sabrás tras el 1er deploy; puedes ponerlo después) |
   | `NEXT_PUBLIC_SITE_URL` | `https://TU-PROYECTO.vercel.app` |

5. **Deploy**. Al terminar te da la URL pública.

## 4. Crear tablas y datos de ejemplo (3 min)

Las tablas hay que crearlas una vez. Desde tu ordenador, con el repo clonado:

```bash
git clone https://github.com/raineribenicio-dotcom/benito.git nuvora
cd nuvora
pnpm install
echo 'DATABASE_URL="<la de Neon>"' > .env   # Prisma lee .env (Next lee .env y .env.local)
pnpm db:generate
pnpm db:push      # crea las tablas en Neon
pnpm db:seed      # carga 5 categorías, productos y el admin
```

Tras esto, recarga tu URL de Vercel: verás la tienda con productos.

- Admin: `https://TU-PROYECTO.vercel.app/admin` → `admin@nuvora.shop` / `admin1234`
- Cupón demo: `BIENVENIDA10`

## 5. (Opcional) Activar funciones extra

Añade estas variables en Vercel cuando las quieras (todas tienen fallback):

- **Cobros reales:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_WEBHOOK_SECRET` (crea el webhook en Stripe apuntando a
  `/api/stripe/webhook`).
- **Login con Google:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- **Emails reales:** `RESEND_API_KEY`, `EMAIL_FROM`.
- **Búsqueda Algolia, imágenes Cloudinary:** ver `.env.example`.
- **Recuperación de carrito abandonado (cron):** `CRON_SECRET` (Vercel Cron ya
  está configurado en `vercel.json`).

## Notas

- Cada `git push` a la rama desplegada genera un nuevo deploy automático.
- Las imágenes de producto: súbelas desde el admin o usa URLs (Cloudinary/S3).
  En local el sandbox no puede descargar imágenes externas, pero en Vercel sí.
