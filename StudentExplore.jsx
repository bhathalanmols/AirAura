import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../api/client";
import { categoryForAqi, AQI_SCALE } from "../lib/aqi";
import SearchStations from "../components/SearchStations";

export default function StudentExplore() {
  const nav = useNavigate();
  const [stations, setStations] = useState([]);

  useEffect(() => { api.get("/stations").then(({ data }) => setStations(data.stations)); }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-2">Explore</div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">All monitored locations</h1>
          <p className="text-sm text-[#94A3B8] mt-2 max-w-2xl">Tap any station card to view its 24-hour trend, pollutant breakdown and 7-day AQI forecast.</p>
        </div>

        <div className="mb-8 max-w-2xl">
          <SearchStations onSelect={(s) => nav(`/location/${s.id}`)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1E293B] border border-[#1E293B] mb-10">
          {stations.map((s) => {
            const c = categoryForAqi(s.current.aqi);
            return (
              <button
                key={s.id}
                data-testid={`explore-card-${s.id}`}
                onClick={() => nav(`/location/${s.id}`)}
                className="bg-[#0B1120] p-6 text-left hover:bg-[#111827] transition-colors group relative"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: c.color }} />
                <div className="flex items-baseline justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#64748B]">{s.type} · {s.state}</div>
                  <div className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${c.border} ${c.text}`}>{c.label.split(" ")[0]}</div>
                </div>
                <div className="font-display font-bold text-xl group-hover:text-[#93C5FD] transition-colors">{s.name}</div>
                <div className="text-xs font-mono text-[#94A3B8] mt-1">{s.city}</div>
                <div className="mt-6 flex items-end justify-between">
                  <div className="font-display font-bold text-4xl" style={{ color: c.color }}>{s.current.aqi}</div>
                  <div className="text-right space-y-0.5 font-mono text-[10px] text-[#94A3B8]">
                    <div>PM2.5 · {s.current.pm25}</div>
                    <div>Hum · {s.current.humidity}%</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* AQI scale */}
        <div className="border border-[#1E293B] bg-[#111827] p-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-5">AQI Reference Scale</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#1E293B] border border-[#1E293B]">
            {AQI_SCALE.map((s) => (
              <div key={s.label} className="bg-[#0B1120] p-4">
                <div className="w-6 h-1 mb-2" style={{ backgroundColor: s.color }} />
                <div className="font-display font-bold">{s.range}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#94A3B8] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
