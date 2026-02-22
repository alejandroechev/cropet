import { useState, useRef, useCallback, useEffect } from "react";
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
import { SAMPLES } from "./samples";

const SAMPLE_CSV = `Date,Tmax,Tmin,RH,Wind,Sunshine
2024-07-01,34.8,25.6,64,2.06,9.25
2024-07-02,33.5,24.8,68,1.85,8.50
2024-07-03,35.2,26.1,60,2.30,9.80
2024-07-04,32.0,24.0,72,1.50,7.20
2024-07-05,34.0,25.0,65,2.10,9.00
2024-07-06,33.8,25.4,63,2.15,8.75
2024-07-07,35.5,26.5,58,2.40,10.00`;

const STORAGE_KEY = "cropet-state";

interface SavedState { csv: string; lat: string; alt: string }

function loadSavedState(): SavedState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch { return null; }
}

export default function App() {
  const saved = loadSavedState();
  const [dark, setDark] = useState(() => localStorage.getItem("cropet-theme") === "dark");
  const [csv, setCsv] = useState(saved?.csv ?? SAMPLE_CSV);
  const [lat, setLat] = useState(saved?.lat ?? "13.73");
  const [alt, setAlt] = useState(saved?.alt ?? "2");
  const [results, setResults] = useState<EToResult[]>([]);
  const [monthly, setMonthly] = useState<MonthlySummary[]>([]);
  const [status, setStatus] = useState("");
  const [samplesOpen, setSamplesOpen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("cropet-theme", dark ? "dark" : "light");
  }, [dark]);

  // Debounced persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ csv, lat, alt })); } catch { /* noop */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [csv, lat, alt]);

  const loadSample = (index: number) => {
    const s = SAMPLES[index];
    setCsv(s.csv);
    setLat(String(s.latitude));
    setAlt(String(s.altitude));
    setResults([]);
    setMonthly([]);
    setStatus(`📂 Loaded "${s.name}" — click Compute ETo to run`);
    setSamplesOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsv(text);
      setResults([]);
      setMonthly([]);
      setStatus(`📂 Loaded "${file.name}" — click Compute ETo to run`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

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

  const exportSVG = () => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "eto-chart.svg";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        style={{ display: "none" }}
        onChange={handleFileUpload}
        data-testid="file-input"
      />
      <div className="toolbar">
        <div className="toolbar-left">
          <h1>🌾 CropET — FAO-56 ETo Calculator</h1>
          <button onClick={() => fileInputRef.current?.click()}>
            📂 Upload
          </button>
          <div className="dropdown" style={{ position: "relative" }}>
            <button onClick={() => setSamplesOpen(!samplesOpen)}>
              📂 Samples
            </button>
            {samplesOpen && (
              <div className="dropdown-menu" style={{
                position: "absolute", top: "100%", left: 0, zIndex: 100,
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 6, padding: 4, minWidth: 300, marginTop: 4,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                {SAMPLES.map((s, i) => (
                  <button key={i} onClick={() => loadSample(i)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "8px 12px", border: "none", borderRadius: 4,
                    background: "transparent", color: "var(--fg)",
                    cursor: "pointer", fontSize: "0.85rem",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <strong>{s.name}</strong>
                    <br />
                    <span style={{ fontSize: "0.78rem", color: "var(--fg2)" }}>{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="primary" onClick={compute}>
            ▶ Compute ETo
          </button>
        </div>
        <div className="toolbar-right">
          <button onClick={() => window.open('/intro.html', '_blank')}>
            📖 Guide
          </button>
          <button onClick={() => window.open('https://github.com/alejandroechev/cropet/issues/new', '_blank')} title="Feedback">
            💬 Feedback
          </button>
          <button onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? "☀️" : "🌙"}
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
          <div className="chart-container" ref={chartRef}>
            <div className="section-header">
              <h3>ETo Time Series</h3>
              <div className="inline-actions">
                <button onClick={exportPNG}>🖼 PNG</button>
                <button onClick={exportSVG}>📐 SVG</button>
              </div>
            </div>
            <EToChart data={results} />
          </div>

          <div className="table-container">
            <div className="section-header">
              <h3>Daily Results</h3>
              <div className="inline-actions">
                <button onClick={() => download(exportDailyCSV(results), "eto-daily.csv")}>
                  📥 CSV
                </button>
              </div>
            </div>
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
              <div className="section-header">
                <h3>Monthly Summary</h3>
                <div className="inline-actions">
                  <button onClick={() => download(exportMonthlyCSV(monthly), "eto-monthly.csv")}>
                    📥 CSV
                  </button>
                </div>
              </div>
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
