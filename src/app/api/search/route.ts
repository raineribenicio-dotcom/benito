import { NextRequest, NextResponse } from "next/server";
import { searchProvider } from "@/lib/search";

// Endpoint de búsqueda instantánea. Usa el proveedor configurado (Algolia o el
// fallback Postgres). Cacheado en el edge unos segundos para aliviar la DB.

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ hits: [] });
  }

  try {
    const hits = await searchProvider.search(q, { limit: 8 });
    return NextResponse.json(
      { hits },
      { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } },
    );
  } catch (err) {
    console.error("[search] error:", (err as Error).message);
    return NextResponse.json({ hits: [] }, { status: 200 });
  }
}
