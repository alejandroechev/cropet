// E2: Solar radiation estimation (FAO-56 Chapter 3)

const SOLAR_CONSTANT = 0.0820; // MJ m⁻² min⁻¹
const STEFAN_BOLTZMANN = 4.903e-9; // MJ m⁻² day⁻¹ K⁻⁴
const ALBEDO = 0.23;

/** Convert degrees to radians */
function rad(deg: number): number {
  return (Math.PI / 180) * deg;
}

/** Inverse relative Earth-Sun distance factor */
export function dr(J: number): number {
  return 1 + 0.033 * Math.cos((2 * Math.PI * J) / 365);
}

/** Solar declination (radians) */
export function solarDeclination(J: number): number {
  return 0.409 * Math.sin((2 * Math.PI * J) / 365 - 1.39);
}

/** Sunset hour angle (radians) */
export function sunsetHourAngle(lat: number, decl: number): number {
  const phi = rad(lat);
  const x = -Math.tan(phi) * Math.tan(decl);
  // Clamp for polar regions
  if (x < -1) return Math.PI;
  if (x > 1) return 0;
  return Math.acos(x);
}

/** Extraterrestrial radiation Ra (MJ m⁻² day⁻¹) */
export function extraterrestrialRadiation(lat: number, J: number): number {
  const phi = rad(lat);
  const d = solarDeclination(J);
  const ws = sunsetHourAngle(lat, d);
  const drVal = dr(J);
  return (24 * 60 / Math.PI) * SOLAR_CONSTANT * drVal *
    (ws * Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.sin(ws));
}

/** Maximum daylight hours N */
export function daylightHours(lat: number, J: number): number {
  const d = solarDeclination(J);
  const ws = sunsetHourAngle(lat, d);
  return (24 / Math.PI) * ws;
}

/** Solar radiation Rs from sunshine hours (MJ m⁻² day⁻¹) */
export function solarRadiation(n: number, N: number, Ra: number, a = 0.25, b = 0.50): number {
  return (a + b * (n / N)) * Ra;
}

/** Clear-sky radiation Rso (MJ m⁻² day⁻¹) */
export function clearSkyRadiation(altitude: number, Ra: number): number {
  return (0.75 + 2e-5 * altitude) * Ra;
}

/** Net shortwave radiation Rns (MJ m⁻² day⁻¹) */
export function netShortwave(Rs: number): number {
  return (1 - ALBEDO) * Rs;
}

/** Net longwave radiation Rnl (MJ m⁻² day⁻¹) */
export function netLongwave(tmax: number, tmin: number, ea: number, Rs: number, Rso: number): number {
  const tkMax = tmax + 273.16;
  const tkMin = tmin + 273.16;
  const avgTk4 = (Math.pow(tkMax, 4) + Math.pow(tkMin, 4)) / 2;
  const humidityFactor = 0.34 - 0.14 * Math.sqrt(ea);
  const cloudFactor = Rso > 0 ? 1.35 * (Rs / Rso) - 0.35 : 0;
  return STEFAN_BOLTZMANN * avgTk4 * humidityFactor * cloudFactor;
}

/** Net radiation Rn (MJ m⁻² day⁻¹) */
export function netRadiation(Rs: number, tmax: number, tmin: number, ea: number, altitude: number, lat: number, J: number): number {
  const Ra = extraterrestrialRadiation(lat, J);
  const Rso = clearSkyRadiation(altitude, Ra);
  const Rns = netShortwave(Rs);
  const Rnl = netLongwave(tmax, tmin, ea, Rs, Rso);
  return Rns - Rnl;
}
