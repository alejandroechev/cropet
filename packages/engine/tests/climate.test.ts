import { describe, it, expect } from "vitest";
import { parseClimateCSV, dayOfYear, fahrenheitToCelsius, mphToMs } from "../src/climate.js";

describe("E1: Climate Data Parser", () => {
  it("converts Fahrenheit to Celsius", () => {
    expect(fahrenheitToCelsius(32)).toBeCloseTo(0, 2);
    expect(fahrenheitToCelsius(212)).toBeCloseTo(100, 2);
    expect(fahrenheitToCelsius(77)).toBeCloseTo(25, 2);
  });

  it("converts mph to m/s", () => {
    expect(mphToMs(1)).toBeCloseTo(0.447, 2);
    expect(mphToMs(10)).toBeCloseTo(4.47, 1);
  });

  it("calculates day of year", () => {
    expect(dayOfYear("2024-01-01")).toBe(1);
    expect(dayOfYear("2024-07-06")).toBe(188);  // leap year
    expect(dayOfYear("2023-12-31")).toBe(365);
  });

  it("parses CSV climate data", () => {
    const csv = `Date,Tmax,Tmin,RH,Wind,Sunshine
2024-07-06,34.8,25.6,64,2.06,9.25`;
    const records = parseClimateCSV(csv);
    expect(records).toHaveLength(1);
    expect(records[0].tmax).toBe(34.8);
    expect(records[0].tmin).toBe(25.6);
    expect(records[0].rhMean).toBe(64);
    expect(records[0].wind).toBe(2.06);
    expect(records[0].sunshine).toBe(9.25);
  });

  it("handles rh_mean column name", () => {
    const csv = `Date,Tmax,Tmin,rh_mean,Wind,Sunshine
2024-01-01,30,20,70,2,8`;
    const records = parseClimateCSV(csv);
    expect(records[0].rhMean).toBe(70);
  });

  it("returns empty array for empty CSV", () => {
    expect(parseClimateCSV("")).toEqual([]);
    expect(parseClimateCSV("Date,Tmax,Tmin,RH,Wind,Sunshine")).toEqual([]);
  });
});
