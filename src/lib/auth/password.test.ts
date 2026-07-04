import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifica una contraseña correcta", async () => {
    const hash = await hashPassword("secreto123");
    expect(await verifyPassword("secreto123", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("secreto123");
    expect(await verifyPassword("otra-cosa", hash)).toBe(false);
  });

  it("genera salts distintos en cada hash", async () => {
    const a = await hashPassword("misma");
    const b = await hashPassword("misma");
    expect(a).not.toBe(b);
  });

  it("rechaza un hash malformado", async () => {
    expect(await verifyPassword("x", "no-es-un-hash")).toBe(false);
  });
});
