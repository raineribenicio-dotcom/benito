import { auth } from "./config";

// Sesión del usuario, ahora respaldada por Auth.js. El carrito, el checkout y el
// guard de admin consumen esta misma firma (no cambian al activar la auth real).

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth();
    return session?.user ?? null;
  } catch {
    return null;
  }
}
