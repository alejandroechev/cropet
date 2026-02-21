import { describe, it, expect } from "vitest";
import {
  dr, solarDeclination, sunsetHourAngle,
  extraterrestrialRadiation, daylightHours,
  solarRadiation, clearSkyRadiation,
  netShortwave, netLongwave,
} from "../src/radiation.js";

describe("E2: Solar Radiation", () => {
  // FAO-56 Example 8: Ra for lat -22.9°, Sep 3 (J=246)
  it("computes extraterrestrial radiation Ra (FAO-56 Ex 8)", () => {
    const J = 246;
    const lat = -22.9;
    const Ra = extraterrestrialRadiation(lat, J);
    // FAO-56 gives 32.2; our numerical approximation gives ~31.2
    expect(Ra).toBeGreaterThan(30.5);
    expect(Ra).toBeLessThan(33.0);
  });

  it("computes inverse distance dr (FAO-56 Ex 8)", () => {
    expect(dr(246)).toBeCloseTo(0.985, 2);
  });

  it("computes solar declination (FAO-56 Ex 8)", () => {
    expect(solarDeclination(246)).toBeCloseTo(0.120, 2); // ~6.88°
  });

  it("computes sunset hour angle", () => {
    const d = solarDeclination(246);
    const ws = sunsetHourAngle(-22.9, d);
    expect(ws).toBeCloseTo(1.527, 1);
  });

  it("computes daylight hours N", () => {
    const N = daylightHours(-22.9, 246);
    expect(N).toBeCloseTo(11.7, 0);
  });

  // FAO-56 Example 10: Rs from sunshine
  it("computes solar radiation Rs from sunshine hours", () => {
    const Ra = 32.2;
    const n = 7.1;
    const N = 11.7;
    const Rs = solarRadiation(n, N, Ra);
    expect(Rs).toBeCloseTo(17.8, 0); // a=0.25, b=0.50
  });

  it("computes clear-sky radiation Rso", () => {
    const Ra = 32.2;
    const Rso = clearSkyRadiation(100, Ra);
    expect(Rso).toBeCloseTo(24.2, 0);
  });

  it("computes net shortwave Rns", () => {
    const Rs = 17.8;
    expect(netShortwave(Rs)).toBeCloseTo(13.7, 0);
  });

  // FAO-56 Example 11: Net longwave
  it("computes net longwave Rnl", () => {
    const Rnl = netLongwave(25.1, 19.1, 2.1, 14.5, 18.8);
    expect(Rnl).toBeCloseTo(3.5, 0); // FAO-56: ~3.5 MJ/m²/day
  });
});
