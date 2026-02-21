import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EToResult } from "@cropet/engine";

interface Props {
  data: EToResult[];
}

export function EToChart({ data }: Props) {
  const chartData = data.map(d => ({
    date: d.date,
    ETo: parseFloat(d.eto.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--fg2)" }}
          tickFormatter={v => v.slice(5)} // MM-DD
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--fg2)" }}
          label={{ value: "ETo (mm/day)", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
        />
        <Tooltip
          contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          labelStyle={{ color: "var(--fg)" }}
        />
        <Line
          type="monotone"
          dataKey="ETo"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--accent)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
