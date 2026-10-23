import { categoryForAqi } from "../lib/aqi";

export default function ForecastStrip({ forecast }) {
  return (
    <div data-testid="forecast-strip" className="border border-[#1E293B] bg-[#111827] p-6">
      <div className="flex items-baseline justify-between mb-5">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">7-Day AQI Forecast</div>
        <div className="text-xs font-mono text-[#64748B]">ML trend model</div>
      </div>
      <div className="grid grid-cols-7 gap-px bg-[#1E293B] border border-[#1E293B]">
        {forecast.map((d, i) => {
          const cat = categoryForAqi(d.aqi);
          const dt = new Date(d.date);
          return (
            <div key={d.date} className="bg-[#0B1120] p-3 text-center" data-testid={`forecast-day-${i}`}>
              <div className="text-[10px] font-mono uppercase text-[#64748B]">{dt.toLocaleDateString([], { weekday: "short" })}</div>
              <div className="text-[10px] font-mono text-[#94A3B8] mb-3">{dt.getDate()}/{dt.getMonth() + 1}</div>
              <div className="font-display font-bold text-2xl" style={{ color: cat.color }}>{d.aqi}</div>
              <div className="text-[9px] uppercase tracking-wider text-[#64748B] mt-2 truncate" title={cat.label}>{cat.label.split(" ")[0]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
