import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

// Enlace de recuperación del email de carrito abandonado. Restaura el carrito de
// invitado fijando su cookie y redirige a /carrito. Solo restaura carritos aún
// activos (no convertidos).

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const home = new URL("/carrito", req.nextUrl.origin);

  if (!token) return NextResponse.redirect(home);

  const cart = await prisma.cart.findFirst({
    where: { token, status: "ACTIVE" },
    select: { token: true },
  });
  if (!cart) return NextResponse.redirect(new URL("/", req.nextUrl.origin));

  const res = NextResponse.redirect(home);
  res.cookies.set("cart_token", cart.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
