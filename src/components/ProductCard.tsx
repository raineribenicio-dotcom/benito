import { formatPrice } from "@/lib/core/money";
import { getI18n } from "@/lib/i18n";
import { Stars } from "./Stars";
import type { CatalogProduct } from "@/lib/core/catalog";

// Tarjeta de producto reutilizable (home, catálogo, relacionados). Mobile-first.

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { currency, locale } = getI18n();
  const money = (amount: number) => formatPrice(amount, product.currency, currency, locale);
  const hasDiscount = product.compareAt != null && product.compareAt > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAt! - product.price) / product.compareAt!) * 100)
    : 0;

  return (
    <a href={`/producto/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">Sin imagen</div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            -{discountPct}%
          </span>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-medium group-hover:text-brand-600">
        {product.title}
      </h3>
      {product.ratingCount > 0 && (
        <div className="mt-1">
          <Stars rating={product.ratingAverage} count={product.ratingCount} />
        </div>
      )}
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-semibold text-brand-700">
          {money(product.price)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-gray-400 line-through">
            {money(product.compareAt!)}
          </span>
        )}
      </div>
    </a>
  );
}
