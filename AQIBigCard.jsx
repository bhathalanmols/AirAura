import { categoryForAqi } from "../lib/aqi";
import { Drop, Thermometer, CloudFog, Wind } from "@phosphor-icons/react";

export default function AQIBigCard({ station, reading }) {
  const cat = categoryForAqi(reading.aqi);
  return (
    <div data-testid="aqi-big-card" className="relative border border-[#1E293B] bg-[#111827] overflow-hidden">
      <div className={`absolute inset-0 ${cat.bg} pointer-events-none`} />
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: cat.color }} />
      <div className="relative p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#94A3B8] mb-2">Live AQI Reading</div>
          <h2 className="font-display text-2xl font-bold tracking-tight" data-testid="station-name">{station.name}</h2>
          <div className="text-xs font-mono text-[#64748B] mt-1">{station.city} · {station.state} · {station.lat?.toFixed(3)}, {station.lng?.toFixed(3)}</div>

          <div className="mt-8 flex items-end gap-6">
            <div>
              <div className="font-display font-bold text-7xl lg:text-8xl tracking-tighter leading-none" style={{ color: cat.color }} data-testid="aqi-value">
                {reading.aqi}
              </div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#64748B] mt-2">US EPA AQI</div>
            </div>
            <div className="pb-3">
              <div className={`inline-block px-3 py-1 border ${cat.border} ${cat.bg} ${cat.text} text-xs uppercase tracking-[0.2em] font-medium`} data-testid="aqi-category">
                {cat.label}
              </div>
              <div className="text-xs font-mono text-[#94A3B8] mt-2 max-w-xs">
                Updated {new Date(reading.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-[#1E293B] border border-[#1E293B]">
          <MetricTile icon={CloudFog} label="PM2.5" value={reading.pm25} unit="µg/m³" />
          <MetricTile icon={Wind} label="PM10" value={reading.pm10} unit="µg/m³" />
          <MetricTile icon={Thermometer} label="Temp" value={reading.temperature} unit="°C" />
          <MetricTile icon={Drop} label="Humidity" value={reading.humidity} unit="%" />
        </div>
      </div>
    </div>
  );
}

function MetricTile({ icon: Icon, label, value, unit }) {
  return (
    <div className="bg-[#0B1120] p-4 flex flex-col gap-2" data-testid={`metric-${label.toLowerCase()}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
        <Icon size={12} /> {label}
      </div>
      <div className="font-display font-bold text-2xl">{value}</div>
      <div className="text-[10px] font-mono text-[#64748B]">{unit}</div>
    </div>
  );
}
