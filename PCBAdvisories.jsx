import { useEffect, useState } from "react";
import Header from "../components/Header";
import { api, formatApiError } from "../api/client";
import { Megaphone } from "@phosphor-icons/react";

const SEVERITIES = [
  { id: "good", label: "Good", color: "#10B981" },
  { id: "moderate", label: "Moderate", color: "#F59E0B" },
  { id: "poor", label: "Poor", color: "#F97316" },
  { id: "severe", label: "Severe", color: "#EF4444" },
];

export default function PCBAdvisories() {
  const [advisories, setAdvisories] = useState([]);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", severity: "moderate", station_ids: [] });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get("/advisories");
    setAdvisories(data.advisories);
  };

  useEffect(() => {
    load();
    api.get("/stations").then(({ data }) => setStations(data.stations));
  }, []);

  const toggleStation = (id) => {
    setForm((f) => ({
      ...f,
      station_ids: f.station_ids.includes(id) ? f.station_ids.filter((x) => x !== id) : [...f.station_ids, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await api.post("/advisories", form);
      setForm({ title: "", message: "", severity: "moderate", station_ids: [] });
      await load();
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-2">PPCB · Public Communications</div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Advisories</h1>
          <p className="text-sm text-[#94A3B8] mt-2">Broadcast official air-quality advisories to citizens of affected zones.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* COMPOSER */}
          <form onSubmit={submit} className="lg:col-span-2 border border-[#1E293B] bg-[#111827] p-6 space-y-4" data-testid="advisory-composer">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">Compose new advisory</div>
            <input
              data-testid="advisory-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title (e.g. Severe smog warning – Ludhiana)"
              required
              className="w-full h-11 px-4 bg-[#0B1120] border border-[#1E293B] focus:border-[#3B82F6] outline-none text-sm transition-colors"
            />
            <textarea
              data-testid="advisory-message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Public message…"
              rows={5}
              required
              className="w-full px-4 py-3 bg-[#0B1120] border border-[#1E293B] focus:border-[#3B82F6] outline-none text-sm transition-colors resize-none"
            />
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-2">Severity</div>
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    data-testid={`severity-${s.id}`}
                    onClick={() => setForm({ ...form, severity: s.id })}
                    className={`text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border transition-colors ${
                      form.severity === s.id ? "bg-[#1E293B] text-white" : "text-[#94A3B8] hover:text-white"
                    }`}
                    style={{ borderColor: form.severity === s.id ? s.color : "#1E293B", color: form.severity === s.id ? s.color : undefined }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-2">Target stations ({form.station_ids.length})</div>
              <div className="max-h-48 overflow-auto border border-[#1E293B] divide-y divide-[#1E293B]">
                {stations.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-[#1E293B]/50 transition-colors cursor-pointer">
                    <input
                      data-testid={`advisory-station-${s.id}`}
                      type="checkbox"
                      checked={form.station_ids.includes(s.id)}
                      onChange={() => toggleStation(s.id)}
                      className="accent-[#3B82F6]"
                    />
                    <div className="flex-1 text-sm">{s.name}</div>
                    <div className="text-[10px] font-mono text-[#64748B]">{s.current.aqi}</div>
                  </label>
                ))}
              </div>
            </div>
            {err && <div data-testid="advisory-error" className="border border-red-500/40 bg-red-500/10 text-red-300 text-xs p-3 font-mono">{err}</div>}
            <button data-testid="advisory-submit" disabled={busy} className="w-full h-11 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-sm uppercase tracking-[0.18em] transition-colors flex items-center justify-center gap-2">
              <Megaphone size={14} /> {busy ? "Broadcasting…" : "Publish advisory"}
            </button>
          </form>

          {/* FEED */}
          <div className="lg:col-span-3 space-y-4" data-testid="advisory-feed">
            {advisories.length === 0 && (
              <div className="border border-[#1E293B] bg-[#111827] p-10 text-center text-sm text-[#64748B]">No advisories yet.</div>
            )}
            {advisories.map((a) => {
              const sev = SEVERITIES.find((s) => s.id === a.severity) || SEVERITIES[1];
              return (
                <div key={a.id} className="border border-[#1E293B] bg-[#111827] p-6 relative" data-testid={`advisory-${a.id}`}>
                  <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: sev.color }} />
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="font-display text-lg font-bold tracking-tight">{a.title}</h3>
                    <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: sev.color }}>{sev.label}</span>
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{a.message}</p>
                  <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
                    <div>{a.author_name}</div>
                    <div>{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  {a.station_ids?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {a.station_ids.map((sid) => (
                        <span key={sid} className="text-[10px] font-mono px-2 py-0.5 border border-[#1E293B] text-[#94A3B8]">{sid}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
