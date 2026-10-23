import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../api/client";
import { categoryForAqi } from "../lib/aqi";
import { TrendUp, TrendDown, Buildings, ShieldWarning } from "@phosphor-icons/react";

export default function PCBDashboard() {
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/overview").then(({ data }) => setData(data));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-[1400px] mx-auto px-6 py-10 text-[#64748B] font-mono">Loading regional overview…</div>
      </div>
    );
  }

  const { summary, hotspots, cleanest, stations } = data;
  const cat = categoryForAqi(summary.average_aqi);
  const filtered = filter === "all" ? stations : stations.filter((s) => s.current.category.code === filter);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="mb-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-2">PPCB · Regional Command</div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Punjab Belt Overview</h1>
          <p className="text-sm text-[#94A3B8] mt-2">Real-time aggregate of {summary.total_stations} monitoring stations across the Punjab–Chandigarh–Delhi corridor.</p>
        </div>

        {/* KPI ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1E293B] border border-[#1E293B] mb-8">
          <KPI label="Regional Avg AQI" value={summary.average_aqi} accent={cat.color} sub={cat.label} testid="kpi-avg" />
          <KPI label="Active Stations" value={summary.total_stations} icon={Buildings} sub="online" testid="kpi-stations" />
          <KPI label="Severe / Poor Zones" value={summary.buckets.severe + summary.buckets.poor} accent="#EF4444" icon={ShieldWarning} sub="needs action" testid="kpi-bad" />
          <KPI label="Clean Zones" value={summary.buckets.good + summary.buckets.moderate} accent="#10B981" sub="acceptable" testid="kpi-good" />
        </div>

        {/* HOTSPOTS & CLEANEST */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <RankList title="Pollution Hotspots" icon={TrendUp} accent="#EF4444" items={hotspots} testid="hotspots-list" onClick={(id) => nav(`/location/${id}`)} />
          <RankList title="Cleanest Stations" icon={TrendDown} accent="#10B981" items={cleanest} testid="cleanest-list" onClick={(id) => nav(`/location/${id}`)} />
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mr-2">Filter</span>
          {[
            { id: "all", label: `All (${stations.length})`, color: "#94A3B8" },
            { id: "good", label: `Good (${summary.buckets.good})`, color: "#10B981" },
            { id: "moderate", label: `Moderate (${summary.buckets.moderate})`, color: "#F59E0B" },
            { id: "poor", label: `Poor (${summary.buckets.poor})`, color: "#F97316" },
            { id: "severe", label: `Severe (${summary.buckets.severe})`, color: "#EF4444" },
          ].map((f) => (
            <button
              key={f.id}
              data-testid={`filter-${f.id}`}
              onClick={() => setFilter(f.id)}
              className={`text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border transition-all ${
                filter === f.id
                  ? "border-[#3B82F6] bg-[#3B82F6]/10 text-white"
                  : "border-[#1E293B] text-[#94A3B8] hover:border-[#334155] hover:text-white"
              }`}
              style={filter === f.id ? { borderColor: f.color, color: f.color } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* STATION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#1E293B] border border-[#1E293B]" data-testid="station-grid">
          {filtered.map((s) => {
            const c = categoryForAqi(s.current.aqi);
            return (
              <button
                key={s.id}
                data-testid={`station-card-${s.id}`}
                onClick={() => nav(`/location/${s.id}`)}
                className="bg-[#0B1120] p-5 text-left hover:bg-[#111827] transition-colors group relative"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: c.color }} />
                <div className="flex items-baseline justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#64748B]">{s.type}</div>
                  <div className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${c.border} ${c.text}`}>{c.label.split(" ")[0]}</div>
                </div>
                <div className="font-display font-bold text-2xl group-hover:text-[#93C5FD] transition-colors">{s.name}</div>
                <div className="text-xs font-mono text-[#94A3B8] mt-1">{s.city}, {s.state}</div>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <div className="font-display font-bold text-4xl" style={{ color: c.color }}>{s.current.aqi}</div>
                    <div className="text-[10px] font-mono uppercase text-[#64748B]">AQI</div>
                  </div>
                  <div className="text-right space-y-0.5 font-mono text-[10px] text-[#94A3B8]">
                    <div>PM2.5 · {s.current.pm25}</div>
                    <div>PM10 · {s.current.pm10}</div>
                    <div>T · {s.current.temperature}°C</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function KPI({ label, value, sub, accent, icon: Icon, testid }) {
  return (
    <div className="bg-[#0B1120] p-6" data-testid={testid}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">{label}</div>
        {Icon && <Icon size={14} className="text-[#64748B]" />}
      </div>
      <div className="font-display font-bold text-4xl" style={{ color: accent || "#F8FAFC" }}>{value}</div>
      <div className="text-xs uppercase tracking-wider text-[#64748B] mt-2">{sub}</div>
    </div>
  );
}

function RankList({ title, icon: Icon, accent, items, testid, onClick }) {
  return (
    <div className="border border-[#1E293B] bg-[#111827]" data-testid={testid}>
      <div className="flex items-center justify-between p-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: accent }} />
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">{title}</div>
        </div>
      </div>
      <div>
        {items.map((s, i) => {
          const c = categoryForAqi(s.current.aqi);
          return (
            <button
              key={s.id}
              onClick={() => onClick?.(s.id)}
              data-testid={`${testid}-item-${i}`}
              className="w-full text-left px-5 py-4 border-b border-[#1E293B] last:border-b-0 hover:bg-[#1E293B] transition-colors flex items-center gap-4"
            >
              <div className="font-mono text-[10px] text-[#64748B] w-6">0{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold truncate">{s.name}</div>
                <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-widest">{s.city}</div>
              </div>
              <div className="font-display font-bold text-2xl" style={{ color: c.color }}>{s.current.aqi}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
