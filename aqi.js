export function categoryForAqi(aqi) {
  if (aqi <= 50) return { label: "Good", color: "#10B981", code: "good", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/40" };
  if (aqi <= 100) return { label: "Moderate", color: "#F59E0B", code: "moderate", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/40" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "#F97316", code: "poor", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#F97316", code: "poor", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#EF4444", code: "severe", text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40" };
  return { label: "Hazardous", color: "#7F1D1D", code: "severe", text: "text-red-500", bg: "bg-red-900/20", border: "border-red-700/60" };
}

export const AQI_SCALE = [
  { range: "0–50", label: "Good", color: "#10B981" },
  { range: "51–100", label: "Moderate", color: "#F59E0B" },
  { range: "101–200", label: "Unhealthy", color: "#F97316" },
  { range: "201–300", label: "Very Unhealthy", color: "#EF4444" },
  { range: "300+", label: "Hazardous", color: "#7F1D1D" },
];
