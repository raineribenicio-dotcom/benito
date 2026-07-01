"use client";

import { useState } from "react";

// Galería de producto: imagen principal con zoom al pasar el ratón y thumbnails
// clicables. Mobile-first (el zoom se desactiva de forma natural en táctil).

export type GalleryImage = { id: string; url: string; alt: string | null };

export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-100 text-gray-300">
        Sin imagen
      </div>
    );
  }

  const main = images[active] ?? images[0];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div>
      <div
        className="aspect-square overflow-hidden rounded-2xl bg-gray-100"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main.url}
          alt={main.alt ?? title}
          className="h-full w-full object-cover transition-transform duration-150"
          style={
            zoom
              ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
              : undefined
          }
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === active}
              className={`aspect-square overflow-hidden rounded-lg ring-1 transition ${
                i === active ? "ring-2 ring-brand-500" : "ring-gray-200 hover:ring-gray-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt ?? ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
