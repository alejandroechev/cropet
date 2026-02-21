// E4: FAO-56 Penman-Monteith ETo equation

import { type ClimateRecord, type LocationParams, dayOfYear } from "./climate.js";
import {
  extraterrestrialRadiation,
  daylightHours,
  solarRadiation,
  netShortwave,
  netLongwave,
  clearSkyRadiation,
} from "./radiation.js";
import {
  saturationVP,
  meanSaturationVP,
  actualVP,
  slopeVPCurve,
  psychrometricConstant,
} from "./psychrometric.js";

export interface EToResult {
  date: string;
  eto: number;       // mm/day
  rn: number;        // MJ m⁻² day⁻¹
  es: number;        // kPa
  ea: number;        // kPa
  delta: number;     // kPa/°C
  gamma: number;     // kPa/°C
}

/**
 * FAO-56 Penman-Monteith Reference Evapotranspiration
 * ETo = [0.408 Δ(Rn-G) + γ(900/(T+273))u₂(es-ea)] / [Δ + γ(1+0.34u₂)]
 * G (soil heat flux) assumed 0 for daily calculations
 */
export function computeETo(record: ClimateRecord, location: LocationParams): EToResult {
  const J = dayOfYear(record.date);
  const tmean = (record.tmax + record.tmin) / 2;

  // Radiation
  const Ra = extraterrestrialRadiation(location.latitude, J);
  const N = daylightHours(location.latitude, J);
  const Rs = solarRadiation(record.sunshine, N, Ra);
  const Rso = clearSkyRadiation(location.altitude, Ra);
  const Rns = netShortwave(Rs);

  // Vapor pressure
  const es = meanSaturationVP(record.tmax, record.tmin);
  const ea = actualVP(record.tmax, record.tmin, record.rhMean);

  const Rnl = netLongwave(record.tmax, record.tmin, ea, Rs, Rso);
  const Rn = Rns - Rnl;

  // Psychrometric
  const delta = slopeVPCurve(tmean);
  const gamma = psychrometricConstant(location.altitude);

  // G = 0 for daily
  const G = 0;
  const u2 = record.wind;

  const numerator = 0.408 * delta * (Rn - G) + gamma * (900 / (tmean + 273)) * u2 * (es - ea);
  const denominator = delta + gamma * (1 + 0.34 * u2);
  const eto = numerator / denominator;

  return {
    date: record.date,
    eto: Math.max(0, eto),
    rn: Rn,
    es,
    ea,
    delta,
    gamma,
  };
}

/** Compute ETo for a full series */
export function computeEToSeries(records: ClimateRecord[], location: LocationParams): EToResult[] {
  return records.map(r => computeETo(r, location));
}
