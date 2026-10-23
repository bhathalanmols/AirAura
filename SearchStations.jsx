import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { api } from "../api/client";
import { categoryForAqi } from "../lib/aqi";

export default function SearchStations({ onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/stations/search?q=${encodeURIComponent(q)}`);
        setResults(data.results || []);
        
        setOpen(true);
      } catch (_e) {
        // silent
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-3 px-4 h-12 border border-[#1E293B] bg-[#0B1120] focus-within:border-[#3B82F6] transition-colors">
        <MagnifyingGlass size={16} className="text-[#64748B]" />
        <input
          data-testid="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          placeholder="Search location – Patiala, Ludhiana, Amritsar…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#64748B] font-mono"
        />
        <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-widest">⌘K</span>
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-[#1E293B] bg-[#0B1120] z-30 max-h-80 overflow-auto" data-testid="search-results">
          {results.map((r) => {
            const cat = categoryForAqi(r.current.aqi);
            return (
              <button
                key={r.id}
                data-testid={`search-result-${r.id}`}
                onClick={() => { setOpen(false); setQ(""); onSelect?.(r); }}
                className="w-full text-left px-4 py-3 border-b border-[#1E293B] hover:bg-[#1E293B] transition-colors flex items-center gap-4"
              >
                <div className="font-display font-bold text-lg w-12 text-right" style={{ color: cat.color }}>{r.current.aqi}</div>
                <div className="flex-1">
                  <div className="text-sm">{r.name}</div>
                  <div className="text-[10px] font-mono uppercase text-[#64748B] tracking-widest">{r.city} · {r.type}</div>
                </div>
                <div className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border ${cat.border} ${cat.text}`}>{cat.label.split(" ")[0]}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
