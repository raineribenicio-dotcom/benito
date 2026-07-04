import { describe, expect, it } from "vitest";
import { shouldRemind, type RemindableCart } from "./abandoned-schedule";

const now = new Date("2026-01-10T12:00:00Z");
const base: RemindableCart = {
  status: "ACTIVE",
  itemCount: 2,
  email: "cliente@example.com",
  updatedAt: new Date("2026-01-10T10:00:00Z"), // 2h de inactividad
  remindedAt: null,
};

describe("shouldRemind", () => {
  it("recuerda un carrito activo con items, email e inactividad en ventana", () => {
    expect(shouldRemind(base, now)).toBe(true);
  });

  it("no recuerda si ya se recordó", () => {
    expect(shouldRemind({ ...base, remindedAt: new Date() }, now)).toBe(false);
  });

  it("no recuerda carritos vacíos", () => {
    expect(shouldRemind({ ...base, itemCount: 0 }, now)).toBe(false);
  });

  it("no recuerda sin email de contacto", () => {
    expect(shouldRemind({ ...base, email: null }, now)).toBe(false);
  });

  it("no recuerda antes del tiempo mínimo de espera", () => {
    const recent = { ...base, updatedAt: new Date("2026-01-10T11:30:00Z") }; // 30 min
    expect(shouldRemind(recent, now)).toBe(false);
  });

  it("no recuerda carritos demasiado antiguos", () => {
    const old = { ...base, updatedAt: new Date("2026-01-05T00:00:00Z") }; // >72h
    expect(shouldRemind(old, now)).toBe(false);
  });

  it("no recuerda carritos ya convertidos", () => {
    expect(shouldRemind({ ...base, status: "CONVERTED" }, now)).toBe(false);
  });
});
