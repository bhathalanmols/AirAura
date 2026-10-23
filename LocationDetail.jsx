import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import AQIBigCard from "../components/AQIBigCard";
import PollutantGrid from "../components/PollutantGrid";
import TrendChart from "../components/TrendChart";
import ForecastStrip from "../components/ForecastStrip";
import HealthTips from "../components/HealthTips";
import { api } from "../api/client";
import { CaretLeft } from "@phosphor-icons/react";

export default function LocationDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    (async () => {
      const [s, h, f] = await Promise.all([
        api.get(`/stations/${id}`),
        api.get(`/stations/${id}/history`),
        api.get(`/stations/${id}/forecast`),
      ]);
      setData(s.data);
      setHistory(h.data.history);
      setForecast(f.data.forecast);
    })();
  }, [id]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <button onClick={() => nav(-1)} data-testid="back-button" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-[#94A3B8] hover:text-white transition-colors mb-6">
          <CaretLeft size={14} /> Back
        </button>
        {data ? (
          <div className="space-y-6">
            <AQIBigCard station={data.station} reading={data.current} />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TrendChart data={history} title="24-Hour AQI Trend" />
                <PollutantGrid reading={data.current} />
              </div>
              <HealthTips tips={data.health_tips} category={data.current.category} />
            </div>
            <ForecastStrip forecast={forecast} />
          </div>
        ) : (
          <div className="text-[#64748B] font-mono text-sm">Loading station…</div>
        )}
      </main>
    </div>
  );
}
