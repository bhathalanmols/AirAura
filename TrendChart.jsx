import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export default function TrendChart({ data, title, dataKey = "aqi", xKey = "timestamp", formatX }) {
  const fmt = formatX || ((v) => new Date(v).toLocaleTimeString([], { hour: "2-digit" }));
  return (
    <div data-testid="trend-chart" className="border border-[#1E293B] bg-[#111827] p-6">
      <div className="flex items-baseline justify-between mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">{title}</div>
        <div className="text-xs font-mono text-[#64748B]">{data.length} points</div>
      </div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1E293B" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey={xKey} tickFormatter={fmt} stroke="#64748B" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0B1120", border: "1px solid #1E293B", borderRadius: 0, fontSize: 12, fontFamily: "IBM Plex Mono" }}
              labelFormatter={(v) => new Date(v).toLocaleString()}
              cursor={{ stroke: "#3B82F6", strokeWidth: 1, strokeDasharray: "2 4" }}
            />
            <ReferenceLine y={100} stroke="#F59E0B" strokeDasharray="2 4" strokeOpacity={0.5} />
            <ReferenceLine y={200} stroke="#EF4444" strokeDasharray="2 4" strokeOpacity={0.5} />
            <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={{ r: 2, fill: "#3B82F6" }} activeDot={{ r: 5, fill: "#93C5FD", stroke: "#3B82F6" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
