import { prisma } from "@/lib/db/client";
import { getCurrentUserId } from "./session";

// Guard de administración. En M5 (Auth.js) comprobará la sesión real y el rol
// ADMIN/STAFF. Hasta entonces, en desarrollo permite el acceso para poder
// construir y probar el panel; en producción bloquea si no hay usuario admin.

export async function requireAdmin(): Promise<{ userId: string | null }> {
  const userId = await getCurrentUserId();

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user && (user.role === "ADMIN" || user.role === "STAFF")) return { userId };
  }

  // TODO(M5): sustituir por auth() real. Acceso de desarrollo controlado:
  if (process.env.NODE_ENV !== "production") return { userId: null };

  throw new Error("No autorizado");
}
