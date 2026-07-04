import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("pasa a minúsculas y usa guiones", () => {
    expect(slugify("Camiseta Orgánica")).toBe("camiseta-organica");
  });

  it("elimina acentos y diacríticos", () => {
    expect(slugify("Niño Pingüino Ñandú")).toBe("nino-pinguino-nandu");
  });

  it("colapsa separadores y símbolos", () => {
    expect(slugify("Auriculares  Pro — 2026!!!")).toBe("auriculares-pro-2026");
  });

  it("recorta guiones de los extremos", () => {
    expect(slugify("  ¡Oferta!  ")).toBe("oferta");
  });
});
