import { describe, expect, it } from "vitest";
import { nextOrderDate, isSubscriptionDue } from "./subscription-schedule";

describe("nextOrderDate", () => {
  const from = new Date("2026-01-01T00:00:00Z");

  it("suma 7 días en semanal", () => {
    expect(nextOrderDate("WEEKLY", from).toISOString().slice(0, 10)).toBe("2026-01-08");
  });

  it("suma 30 días en mensual", () => {
    expect(nextOrderDate("MONTHLY", from).toISOString().slice(0, 10)).toBe("2026-01-31");
  });

  it("suma 90 días en trimestral", () => {
    expect(nextOrderDate("QUARTERLY", from).toISOString().slice(0, 10)).toBe("2026-04-01");
  });

  it("no muta la fecha de origen", () => {
    nextOrderDate("MONTHLY", from);
    expect(from.toISOString().slice(0, 10)).toBe("2026-01-01");
  });
});

describe("isSubscriptionDue", () => {
  const now = new Date("2026-02-01T00:00:00Z");

  it("vence si está activa y la fecha ya pasó", () => {
    expect(isSubscriptionDue({ status: "ACTIVE", nextOrderAt: new Date("2026-01-31T00:00:00Z") }, now)).toBe(true);
  });

  it("no vence si la fecha es futura", () => {
    expect(isSubscriptionDue({ status: "ACTIVE", nextOrderAt: new Date("2026-02-05T00:00:00Z") }, now)).toBe(false);
  });

  it("no vence si está pausada aunque toque la fecha", () => {
    expect(isSubscriptionDue({ status: "PAUSED", nextOrderAt: new Date("2026-01-01T00:00:00Z") }, now)).toBe(false);
  });
});
