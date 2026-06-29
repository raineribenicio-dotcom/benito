// Sesión del usuario. Stub para M3: devuelve null (compra como invitado).
// En M5 se reemplaza por la sesión real de Auth.js (auth()), sin cambiar la
// firma para que el carrito y el checkout no necesiten modificarse.

export async function getCurrentUserId(): Promise<string | null> {
  return null;
}
