import { describe, expect, it } from "vitest";
import { nextOrderDate } from "./subscription-schedule";

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
