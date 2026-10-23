import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AQIBigCard from "../components/AQIBigCard";
import PollutantGrid from "../components/PollutantGrid";
import TrendChart from "../components/TrendChart";
import ForecastStrip from "../components/ForecastStrip";
import HealthTips from "../components/HealthTips";
import SearchStations from "../components/SearchStations";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/client";
import { ArrowsClockwise } from "@phosphor-icons/react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stationId, setStationId] = useState(user?.home_station_id || "thapar-campus");
  const [station, setStation] = useState(null);
  const [current, setCurrent] = useState(null);
  const [tips, setTips] = useState([]);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (id) => {
    setLoading(true);
    try {
      const [s, h, f] = await Promise.all([
        api.get(`/stations/${id}`),
        api.get(`/stations/${id}/history`),
        api.get(`/stations/${id}/forecast`),
      ]);
      setStation(s.data.station);
      setCurrent(s.data.current);
      setTips(s.data.health_tips);
      setHistory(h.data.history);
      setForecast(f.data.forecast);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(stationId); }, [stationId, load]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-2">Welcome back · {user?.name}</div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Your air report</h1>
            <p className="text-sm text-[#94A3B8] mt-2 max-w-xl">
              Currently viewing readings from <span className="text-[#93C5FD]">{station?.name || "…"}</span>. Search any location below to compare.
            </p>
          </div>
          <button
            data-testid="refresh-button"
            onClick={() => load(stationId)}
            className="h-10 px-4 border border-[#1E293B] hover:border-[#3B82F6] hover:bg-[#111827] transition-all flex items-center gap-2 text-xs uppercase tracking-[0.18em]"
          >
            <ArrowsClockwise size={14} /> Refresh
          </button>
        </div>

        <div className="mb-8">
          <SearchStations onSelect={(s) => setStationId(s.id)} />
        </div>

        {loading || !current || !station ? (
          <SkeletonBlock />
        ) : (
          <div className="space-y-6">
            <AQIBigCard station={station} reading={current} />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TrendChart data={history} title="24-Hour AQI Trend" dataKey="aqi" xKey="timestamp" />
                <PollutantGrid reading={current} />
              </div>
              <div className="space-y-6">
                <HealthTips tips={tips} category={current.category} />
                <button
                  data-testid="view-detail-button"
                  onClick={() => nav(`/location/${station.id}`)}
                  className="w-full h-12 border border-[#1E293B] hover:border-[#3B82F6] hover:bg-[#111827] transition-all text-xs uppercase tracking-[0.18em] text-[#94A3B8]"
                >
                  Open full station profile →
                </button>
              </div>
            </div>

            <ForecastStrip forecast={forecast} />
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-72 border border-[#1E293B] bg-[#111827]/40" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 border border-[#1E293B] bg-[#111827]/40" />
        <div className="h-64 border border-[#1E293B] bg-[#111827]/40" />
      </div>
    </div>
  );
}
