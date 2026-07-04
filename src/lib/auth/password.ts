import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// Hash de contraseñas con scrypt (incluido en Node, sin dependencias nativas).
// Formato almacenado: "<saltHex>:<hashHex>".

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  const hash = Buffer.from(hashHex, "hex");
  return hash.length === derived.length && timingSafeEqual(hash, derived);
}
