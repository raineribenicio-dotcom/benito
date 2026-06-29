"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/core/money";
import type { SearchHit } from "@/lib/search";

// Búsqueda instantánea con autocompletado e imágenes. Debounce + cancelación.

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { hits: SearchHit[] };
          setHits(data.hits);
          setOpen(true);
        }
      } catch {
        /* abortado o error de red: ignoramos */
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="search" className="sr-only">
        Buscar productos
      </label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar productos…"
        className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
        autoComplete="off"
      />
      {open && hits.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-96 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {hits.map((h) => (
            <li key={h.id}>
              <a
                href={`/producto/${h.slug}`}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
              >
                <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                  {h.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </span>
                <span className="flex-1 truncate text-sm">{h.title}</span>
                <span className="text-sm font-semibold text-brand-700">
                  {formatMoney(h.price, h.currency)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
