import { ShieldCheck } from "@phosphor-icons/react";

export default function HealthTips({ tips, category }) {
  return (
    <div data-testid="health-tips" className="border border-[#1E293B] bg-[#111827] p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck size={14} className="text-[#93C5FD]" />
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">Health Recommendations</div>
      </div>
      <ul className="space-y-3">
        {tips.map((t, i) => (
          <li key={i} className="flex gap-3 text-sm text-[#E2E8F0]" data-testid={`health-tip-${i}`}>
            <span className="font-mono text-[10px] text-[#3B82F6] mt-1">0{i + 1}</span>
            <span className="leading-relaxed">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
