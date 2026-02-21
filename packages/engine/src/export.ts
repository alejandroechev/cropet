// E5: Monthly aggregation and CSV export

import { type EToResult } from "./eto.js";

export interface MonthlySummary {
  month: string;       // YYYY-MM
  meanETo: number;     // mm/day
  totalETo: number;    // mm
  count: number;
}

export function aggregateMonthly(results: EToResult[]): MonthlySummary[] {
  const groups = new Map<string, { sum: number; count: number }>();
  for (const r of results) {
    const month = r.date.substring(0, 7); // YYYY-MM
    const g = groups.get(month) ?? { sum: 0, count: 0 };
    g.sum += r.eto;
    g.count++;
    groups.set(month, g);
  }
  const summaries: MonthlySummary[] = [];
  for (const [month, g] of groups) {
    summaries.push({
      month,
      meanETo: g.sum / g.count,
      totalETo: g.sum,
      count: g.count,
    });
  }
  return summaries.sort((a, b) => a.month.localeCompare(b.month));
}

export function exportDailyCSV(results: EToResult[]): string {
  const header = "Date,ETo (mm/day),Rn (MJ/m2/d),es (kPa),ea (kPa)";
  const rows = results.map(r =>
    `${r.date},${r.eto.toFixed(2)},${r.rn.toFixed(2)},${r.es.toFixed(3)},${r.ea.toFixed(3)}`
  );
  return [header, ...rows].join("\n");
}

export function exportMonthlyCSV(summaries: MonthlySummary[]): string {
  const header = "Month,Mean ETo (mm/day),Total ETo (mm),Days";
  const rows = summaries.map(s =>
    `${s.month},${s.meanETo.toFixed(2)},${s.totalETo.toFixed(1)},${s.count}`
  );
  return [header, ...rows].join("\n");
}
