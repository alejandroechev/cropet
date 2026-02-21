import { describe, it, expect } from "vitest";
import { aggregateMonthly, exportDailyCSV, exportMonthlyCSV } from "../src/export.js";
import type { EToResult } from "../src/eto.js";

describe("E5: Monthly Aggregation & Export", () => {
  const results: EToResult[] = [
    { date: "2024-07-01", eto: 5.0, rn: 15, es: 4.5, ea: 2.8, delta: 0.22, gamma: 0.067 },
    { date: "2024-07-02", eto: 4.8, rn: 14, es: 4.4, ea: 2.7, delta: 0.21, gamma: 0.067 },
    { date: "2024-08-01", eto: 4.5, rn: 13, es: 4.2, ea: 2.6, delta: 0.20, gamma: 0.067 },
  ];

  it("aggregates monthly", () => {
    const monthly = aggregateMonthly(results);
    expect(monthly).toHaveLength(2);
    expect(monthly[0].month).toBe("2024-07");
    expect(monthly[0].meanETo).toBeCloseTo(4.9, 1);
    expect(monthly[0].totalETo).toBeCloseTo(9.8, 1);
    expect(monthly[0].count).toBe(2);
    expect(monthly[1].month).toBe("2024-08");
    expect(monthly[1].count).toBe(1);
  });

  it("exports daily CSV", () => {
    const csv = exportDailyCSV(results);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Date");
    expect(lines[0]).toContain("ETo");
    expect(lines).toHaveLength(4); // header + 3 rows
    expect(lines[1]).toContain("2024-07-01");
    expect(lines[1]).toContain("5.00");
  });

  it("exports monthly CSV", () => {
    const monthly = aggregateMonthly(results);
    const csv = exportMonthlyCSV(monthly);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Month");
    expect(lines).toHaveLength(3); // header + 2 months
  });

  it("handles empty input", () => {
    expect(aggregateMonthly([])).toEqual([]);
    expect(exportDailyCSV([])).toBe("Date,ETo (mm/day),Rn (MJ/m2/d),es (kPa),ea (kPa)");
  });
});
