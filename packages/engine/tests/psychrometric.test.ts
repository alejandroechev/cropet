import { describe, it, expect } from "vitest";
import {
  saturationVP, meanSaturationVP, actualVP,
  slopeVPCurve, atmosphericPressure, psychrometricConstant,
} from "../src/psychrometric.js";

describe("E3: Psychrometric Calculations", () => {
  // FAO-56 Table 2.3
  it("computes saturation VP at 20°C", () => {
    expect(saturationVP(20)).toBeCloseTo(2.338, 2);
  });

  it("computes saturation VP at 25°C", () => {
    expect(saturationVP(25)).toBeCloseTo(3.168, 2);
  });

  it("computes saturation VP at 30°C", () => {
    expect(saturationVP(30)).toBeCloseTo(4.243, 2);
  });

  it("computes mean saturation VP", () => {
    const es = meanSaturationVP(34.8, 25.6);
    expect(es).toBeCloseTo(4.42, 1);
  });

  it("computes actual VP from RH", () => {
    const ea = actualVP(34.8, 25.6, 64);
    expect(ea).toBeCloseTo(2.83, 1);
  });

  // FAO-56: slope at 25°C → 0.1888 kPa/°C (approximate)
  it("computes slope of VP curve", () => {
    expect(slopeVPCurve(25)).toBeCloseTo(0.189, 2);
  });

  // FAO-56 Example 2: P at 1800m altitude
  it("computes atmospheric pressure at altitude", () => {
    expect(atmosphericPressure(0)).toBeCloseTo(101.3, 0);
    expect(atmosphericPressure(1800)).toBeCloseTo(81.8, 0);
  });

  it("computes psychrometric constant", () => {
    expect(psychrometricConstant(0)).toBeCloseTo(0.0673, 3);
    expect(psychrometricConstant(1800)).toBeCloseTo(0.0544, 3);
  });
});
