// E1: Climate data types and parser

export interface ClimateRecord {
  date: string;        // ISO date string YYYY-MM-DD
  tmax: number;        // °C
  tmin: number;        // °C
  rhMean: number;      // % (0-100)
  wind: number;        // m/s at 2m height
  sunshine: number;    // hours
}

export interface LocationParams {
  latitude: number;    // decimal degrees (positive N, negative S)
  altitude: number;    // meters above sea level
}

export function fahrenheitToCelsius(f: number): number {
  return (f - 32) * 5 / 9;
}

export function mphToMs(mph: number): number {
  return mph * 0.44704;
}

export function parseClimateCSV(csv: string): ClimateRecord[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const cols = header.split(",").map(c => c.trim());

  const idx = {
    date: cols.findIndex(c => c === "date"),
    tmax: cols.findIndex(c => c === "tmax"),
    tmin: cols.findIndex(c => c === "tmin"),
    rh: cols.findIndex(c => c === "rh" || c === "rh_mean" || c === "rhmean"),
    wind: cols.findIndex(c => c === "wind"),
    sunshine: cols.findIndex(c => c === "sunshine" || c === "sun"),
  };

  const records: ClimateRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map(v => v.trim());
    if (vals.length < 6) continue;
    records.push({
      date: vals[idx.date],
      tmax: parseFloat(vals[idx.tmax]),
      tmin: parseFloat(vals[idx.tmin]),
      rhMean: parseFloat(vals[idx.rh]),
      wind: parseFloat(vals[idx.wind]),
      sunshine: parseFloat(vals[idx.sunshine]),
    });
  }
  return records;
}

/** Day of year from ISO date string */
export function dayOfYear(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00Z");
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
}
