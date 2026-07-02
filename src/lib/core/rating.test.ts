import { describe, expect, it } from "vitest";
import { computeRatingAggregate } from "./rating";

describe("computeRatingAggregate", () => {
  it("devuelve 0 sin valoraciones", () => {
    expect(computeRatingAggregate([])).toEqual({ average: 0, count: 0 });
  });

  it("calcula media y conteo", () => {
    expect(computeRatingAggregate([5, 4, 3])).toEqual({ average: 4, count: 3 });
  });

  it("redondea la media a 1 decimal", () => {
    expect(computeRatingAggregate([5, 4]).average).toBe(4.5);
    expect(computeRatingAggregate([5, 4, 4]).average).toBe(4.3); // 4.333 -> 4.3
  });
});
