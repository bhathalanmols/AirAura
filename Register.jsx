import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api/client";
import { Wind, ArrowRight } from "@phosphor-icons/react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", password: "", home_station_id: "thapar-campus",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/stations").then(({ data }) => setStations(data.stations)).catch(() => {});
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    const res = await register({ ...form, role: "student" });
    setLoading(false);
    if (!res.ok) { setErr(res.error); return; }
    nav("/student");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-12 aa-grid-bg">
      <div className="w-full max-w-lg border border-[#1E293B] bg-[#0B1120] p-8 lg:p-12">
        <Link to="/" className="inline-flex items-center gap-3 mb-8" data-testid="register-logo">
          <div className="w-9 h-9 border border-[#3B82F6] flex items-center justify-center bg-[#3B82F6]/10">
            <Wind size={20} weight="duotone" className="text-[#93C5FD]" />
          </div>
          <div className="font-display font-bold tracking-tight">AirAura</div>
        </Link>

        <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-3">Create account</div>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Register as student</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" testid="register-name" value={form.name} onChange={(v) => update("name", v)} placeholder="Navya Sharma" />
          <Field label="Email" testid="register-email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="you@thapar.edu" />
          <Field label="Password" testid="register-password" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="min 6 characters" />

          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-2">Home station</div>
            <select
              data-testid="register-station"
              value={form.home_station_id}
              onChange={(e) => update("home_station_id", e.target.value)}
              className="w-full h-12 px-4 bg-[#0B1120] border border-[#1E293B] focus:border-[#3B82F6] outline-none text-sm font-mono transition-colors"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
              ))}
            </select>
          </label>

          {err && <div data-testid="register-error" className="border border-red-500/40 bg-red-500/10 text-red-300 text-xs p-3 font-mono">{err}</div>}

          <button data-testid="register-submit" disabled={loading} className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-[0.18em]">
            {loading ? "Creating…" : <>Create account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="mt-6 text-xs font-mono text-[#64748B]">
          Already registered?{" "}
          <Link to="/login" data-testid="register-login-link" className="text-[#93C5FD] hover:text-white transition-colors">Sign in →</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, testid, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-2">{label}</div>
      <input
        data-testid={testid}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full h-12 px-4 bg-[#0B1120] border border-[#1E293B] focus:border-[#3B82F6] outline-none text-sm font-mono placeholder:text-[#64748B] transition-colors"
      />
    </label>
  );
}
