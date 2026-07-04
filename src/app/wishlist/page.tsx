import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";
import { getWishlist } from "@/lib/core/wishlist";
import { formatPrice } from "@/lib/core/money";
import { getI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { removeFromWishlistAction } from "@/lib/actions/wishlist";

export const metadata: Metadata = { title: "Lista de deseos", robots: { index: false } };

export default async function WishlistPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const items = await getWishlist(userId);
  const { currency, locale } = getI18n();

  return (
    <>
      <SiteHeader />
      <main className="container py-8">
        <h1 className="text-2xl font-bold">Lista de deseos</h1>

        {items.length === 0 ? (
          <p className="mt-6 text-gray-500">
            Tu lista está vacía. Pulsa ♡ en cualquier producto para guardarlo.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => {
              const stock = it.variant.stockLevels.reduce((s, l) => s + l.available, 0);
              return (
                <div key={it.id} className="group relative">
                  <a href={`/producto/${it.variant.product.slug}`} className="block">
                    <div className="aspect-square overflow-hidden rounded-xl bg-gray-100">
                      {it.variant.product.media[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.variant.product.media[0].url}
                          alt={it.variant.product.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <h3 className="mt-2 line-clamp-1 text-sm font-medium">{it.variant.product.title}</h3>
                    <p className="text-sm font-semibold text-brand-700">
                      {formatPrice(it.variant.priceAmount, it.variant.currency, currency, locale)}
                    </p>
                  </a>
                  {stock <= 0 && <p className="text-xs text-red-600">Agotado</p>}
                  <form action={removeFromWishlistAction} className="mt-1">
                    <input type="hidden" name="variantId" value={it.variantId} />
                    <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                      Quitar
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
