import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../api/client";
import { categoryForAqi } from "../lib/aqi";

export default function PCBStations() {
  const nav = useNavigate();
  const [stations, setStations] = useState([]);
  const [sort, setSort] = useState("aqi-desc");

  useEffect(() => { api.get("/stations").then(({ data }) => setStations(data.stations)); }, []);

  const sorted = [...stations].sort((a, b) => {
    if (sort === "aqi-desc") return b.current.aqi - a.current.aqi;
    if (sort === "aqi-asc") return a.current.aqi - b.current.aqi;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-2">PPCB · Network</div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Monitoring Stations</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Sort</span>
            <select
              data-testid="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 px-3 bg-[#0B1120] border border-[#1E293B] focus:border-[#3B82F6] outline-none text-xs font-mono"
            >
              <option value="aqi-desc">AQI · High → Low</option>
              <option value="aqi-asc">AQI · Low → High</option>
              <option value="name">Name · A → Z</option>
            </select>
          </div>
        </div>

        <div className="border border-[#1E293B] bg-[#111827]" data-testid="stations-table">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#1E293B] text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Station</div>
            <div className="col-span-2">City</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1 text-right">AQI</div>
            <div className="col-span-1 text-right">PM2.5</div>
            <div className="col-span-1 text-right">PM10</div>
            <div className="col-span-1 text-right">Temp</div>
            <div className="col-span-1 text-right">Status</div>
          </div>
          {sorted.map((s, i) => {
            const c = categoryForAqi(s.current.aqi);
            return (
              <button
                key={s.id}
                data-testid={`station-row-${s.id}`}
                onClick={() => nav(`/location/${s.id}`)}
                className="w-full grid grid-cols-12 gap-4 px-5 py-4 border-b border-[#1E293B] last:border-b-0 hover:bg-[#1E293B]/50 transition-colors text-left items-center"
              >
                <div className="col-span-1 font-mono text-[10px] text-[#64748B]">{String(i + 1).padStart(2, "0")}</div>
                <div className="col-span-3 font-display font-semibold truncate">{s.name}</div>
                <div className="col-span-2 text-xs text-[#94A3B8] truncate">{s.city}</div>
                <div className="col-span-1 text-[10px] uppercase tracking-widest text-[#64748B]">{s.type}</div>
                <div className="col-span-1 text-right font-display font-bold text-xl" style={{ color: c.color }}>{s.current.aqi}</div>
                <div className="col-span-1 text-right font-mono text-xs text-[#94A3B8]">{s.current.pm25}</div>
                <div className="col-span-1 text-right font-mono text-xs text-[#94A3B8]">{s.current.pm10}</div>
                <div className="col-span-1 text-right font-mono text-xs text-[#94A3B8]">{s.current.temperature}°</div>
                <div className="col-span-1 text-right">
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${c.border} ${c.text}`}>{c.label.split(" ")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
