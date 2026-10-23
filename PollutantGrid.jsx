export default function PollutantGrid({ reading }) {
  const items = [
    { key: "pm25", label: "PM 2.5", value: reading.pm25, unit: "µg/m³", max: 250 },
    { key: "pm10", label: "PM 10", value: reading.pm10, unit: "µg/m³", max: 430 },
    { key: "no2", label: "NO₂", value: reading.no2, unit: "µg/m³", max: 200 },
    { key: "so2", label: "SO₂", value: reading.so2, unit: "µg/m³", max: 80 },
    { key: "o3", label: "O₃", value: reading.o3, unit: "µg/m³", max: 180 },
    { key: "co2", label: "CO₂", value: reading.co2, unit: "ppm", max: 1500 },
  ];
  return (
    <div data-testid="pollutant-grid" className="border border-[#1E293B] bg-[#111827] p-6">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-5">Pollutant Concentrations</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
        {items.map((it) => {
          const pct = Math.min(100, (it.value / it.max) * 100);
          const color = pct > 80 ? "#EF4444" : pct > 55 ? "#F97316" : pct > 30 ? "#F59E0B" : "#10B981";
          return (
            <div key={it.key} data-testid={`pollutant-${it.key}`}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-[#94A3B8]">{it.label}</span>
                <span className="font-mono text-[10px] text-[#64748B]">{it.unit}</span>
              </div>
              <div className="font-display font-bold text-xl mb-2">{it.value}</div>
              <div className="h-1 bg-[#1E293B] relative">
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
