import { useState, useRef, useCallback } from "react";
import {
  parseClimateCSV,
  computeEToSeries,
  aggregateMonthly,
  exportDailyCSV,
  exportMonthlyCSV,
  type ClimateRecord,
  type LocationParams,
  type EToResult,
  type MonthlySummary,
} from "@cropet/engine";
import { EToChart } from "./EToChart";

const SAMPLE_CSV = `Date,Tmax,Tmin,RH,Wind,Sunshine
2024-07-01,34.8,25.6,64,2.06,9.25
2024-07-02,33.5,24.8,68,1.85,8.50
2024-07-03,35.2,26.1,60,2.30,9.80
2024-07-04,32.0,24.0,72,1.50,7.20
2024-07-05,34.0,25.0,65,2.10,9.00
2024-07-06,33.8,25.4,63,2.15,8.75
2024-07-07,35.5,26.5,58,2.40,10.00`;

export default function App() {
  const [dark, setDark] = useState(false);
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [lat, setLat] = useState("13.73");
  const [alt, setAlt] = useState("2");
  const [results, setResults] = useState<EToResult[]>([]);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [status, setStatus] = useState("");
  const chartRef = useRef<HTMLDivElement>(null);

  const compute = useCallback(() => {
    try {
      const records: ClimateRecord[] = parseClimateCSV(csv);
      if (records.length === 0) {
        setStatus("⚠ No valid climate records found. Check CSV format.");
        return;
      }
      const location: LocationParams = {
        latitude: parseFloat(lat),
        altitude: parseFloat(alt),
      };
      const eto = computeEToSeries(records, location);
      setResults(eto);
      setMonthly(aggregateMonthly(eto));
      setStatus(`✓ Computed ETo for ${eto.length} days`);
    } catch (e: unknown) {
      setStatus(`✗ Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [csv, lat, alt]);

  const download = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = dark ? "#1a1a2e" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "eto-chart.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className={dark ? "app dark" : "app"}>
      <div className="toolbar">
        <h1>🌾 CropET — FAO-56 ETo Calculator</h1>
        <div className="toolbar-actions">
          <button onClick={() => window.open('/intro.html', '_blank')}>
            📖 Guide
          </button>
          <button onClick={() => setDark(!dark)}>
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      <div className="location-panel">
        <label>
          Latitude (°N)
          <input type="number" step="0.01" value={lat} onChange={e => setLat(e.target.value)} />
        </label>
        <label>
          Altitude (m)
          <input type="number" step="1" value={alt} onChange={e => setAlt(e.target.value)} />
        </label>
        <button className="primary" onClick={compute}>
          ▶ Compute ETo
        </button>
      </div>

      <div className="data-section">
        <h3>Climate Data (CSV: Date, Tmax, Tmin, RH, Wind, Sunshine)</h3>
        <textarea
          className="csv-input"
          value={csv}
          onChange={e => setCsv(e.target.value)}
          placeholder="Paste CSV data here..."
        />
      </div>

      {status && <div className="status">{status}</div>}

      {results.length > 0 && (
        <>
          <div className="export-bar">
            <button onClick={() => download(exportDailyCSV(results), "eto-daily.csv")}>
              📥 Daily CSV
            </button>
            <button onClick={() => download(exportMonthlyCSV(monthly), "eto-monthly.csv")}>
              📥 Monthly CSV
            </button>
            <button onClick={exportPNG}>🖼 Export Chart PNG</button>
          </div>

          <div className="chart-container" ref={chartRef}>
            <h3>ETo Time Series</h3>
            <EToChart data={results} />
          </div>

          <div className="table-container">
            <h3 style={{ marginBottom: 8, fontSize: "0.95rem", color: "var(--fg2)" }}>
              Daily Results
            </h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>ETo (mm/day)</th>
                  <th>Rn (MJ/m²/d)</th>
                  <th>es (kPa)</th>
                  <th>ea (kPa)</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.date}>
                    <td>{r.date}</td>
                    <td>{r.eto.toFixed(2)}</td>
                    <td>{r.rn.toFixed(2)}</td>
                    <td>{r.es.toFixed(3)}</td>
                    <td>{r.ea.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {monthly.length > 0 && (
            <div className="table-container">
              <h3 style={{ marginBottom: 8, fontSize: "0.95rem", color: "var(--fg2)" }}>
                Monthly Summary
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Mean ETo (mm/day)</th>
                    <th>Total ETo (mm)</th>
                    <th>Days</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map(m => (
                    <tr key={m.month}>
                      <td>{m.month}</td>
                      <td>{m.meanETo.toFixed(2)}</td>
                      <td>{m.totalETo.toFixed(1)}</td>
                      <td>{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
