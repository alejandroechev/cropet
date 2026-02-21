import { describe, it, expect } from "vitest";
import { computeETo, computeEToSeries } from "../src/eto.js";
import type { ClimateRecord, LocationParams } from "../src/climate.js";

describe("E4: FAO-56 Penman-Monteith ETo", () => {
  // FAO-56 Example 18: Bangkok, 6 July
  // Lat 13.73°N, Alt 2m, Tmax=34.8, Tmin=25.6, RH=64%, Wind=2.06 m/s, Sun=9.25h
  // Expected ETo ≈ 5.0 mm/day (FAO paper gives range depending on radiation model)
  const bangkok: LocationParams = { latitude: 13.73, altitude: 2 };
  const record: ClimateRecord = {
    date: "2024-07-06",
    tmax: 34.8,
    tmin: 25.6,
    rhMean: 64,
    wind: 2.06,
    sunshine: 9.25,
  };

  it("computes ETo for FAO-56 Example 18 conditions", () => {
    const result = computeETo(record, bangkok);
    // FAO-56 gives ~5.0 mm/day for these conditions
    expect(result.eto).toBeGreaterThan(4.0);
    expect(result.eto).toBeLessThan(6.5);
  });

  it("returns correct structure", () => {
    const result = computeETo(record, bangkok);
    expect(result.date).toBe("2024-07-06");
    expect(result.rn).toBeGreaterThan(0);
    expect(result.es).toBeGreaterThan(result.ea);
    expect(result.delta).toBeGreaterThan(0);
    expect(result.gamma).toBeGreaterThan(0);
  });

  it("ETo is non-negative", () => {
    const coldRecord: ClimateRecord = {
      date: "2024-01-15",
      tmax: 5,
      tmin: -2,
      rhMean: 95,
      wind: 0.5,
      sunshine: 2,
    };
    const result = computeETo(coldRecord, { latitude: 50, altitude: 100 });
    expect(result.eto).toBeGreaterThanOrEqual(0);
  });

  it("computes series", () => {
    const records = [record, { ...record, date: "2024-07-07" }];
    const results = computeEToSeries(records, bangkok);
    expect(results).toHaveLength(2);
    expect(results[0].date).toBe("2024-07-06");
    expect(results[1].date).toBe("2024-07-07");
  });
});
