// E3: Psychrometric & Vapor Pressure (FAO-56 Chapter 2)

/** Saturation vapor pressure e°(T) in kPa */
export function saturationVP(T: number): number {
  return 0.6108 * Math.exp((17.27 * T) / (T + 237.3));
}

/** Mean saturation vapor pressure from Tmax and Tmin */
export function meanSaturationVP(tmax: number, tmin: number): number {
  return (saturationVP(tmax) + saturationVP(tmin)) / 2;
}

/** Actual vapor pressure from RH mean and temperatures */
export function actualVP(tmax: number, tmin: number, rhMean: number): number {
  const es = meanSaturationVP(tmax, tmin);
  return es * rhMean / 100;
}

/** Slope of saturation vapor pressure curve Δ (kPa/°C) at mean temperature */
export function slopeVPCurve(T: number): number {
  const eT = saturationVP(T);
  return (4098 * eT) / Math.pow(T + 237.3, 2);
}

/** Atmospheric pressure P (kPa) from altitude (m) */
export function atmosphericPressure(altitude: number): number {
  return 101.3 * Math.pow((293 - 0.0065 * altitude) / 293, 5.26);
}

/** Psychrometric constant γ (kPa/°C) */
export function psychrometricConstant(altitude: number): number {
  const P = atmosphericPressure(altitude);
  return 0.665e-3 * P;
}
