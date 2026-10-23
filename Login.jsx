import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Wind, GraduationCap, ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    nav(res.user.role === "pcb_official" ? "/pcb" : "/student");
  };

  const fillDemo = () => {
    if (tab === "student") { setEmail("student@thapar.edu"); setPassword("thapar@123"); }
    else { setEmail("admin@ppcb.gov.in"); setPassword("admin@123"); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left visual */}
      <div className="hidden lg:block relative overflow-hidden border-r border-[#1E293B]">
        <div className="absolute inset-0 aa-grid-bg opacity-40" />
        <div
          className="absolute inset-0 opacity-50 mix-blend-screen"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/12141052/pexels-photo-12141052.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120]/40 via-[#0B1120]/80 to-[#0B1120]" />
        <div className="relative p-12 h-full flex flex-col">
          <Link to="/" className="flex items-center gap-3" data-testid="login-logo">
            <div className="w-9 h-9 border border-[#3B82F6] flex items-center justify-center bg-[#3B82F6]/10">
              <Wind size={20} weight="duotone" className="text-[#93C5FD]" />
            </div>
            <div className="font-display font-bold tracking-tight">AirAura</div>
          </Link>
          <div className="mt-auto">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#93C5FD] mb-4">Access Control</div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tighter leading-tight">
              Two doors.<br />Same atmosphere.
            </h1>
            <p className="text-[#94A3B8] mt-6 max-w-md leading-relaxed">
              Students get a focused view of their block. PPCB officials get a region-wide command grid. Pick your door.
            </p>
          </div>
        </div>
      </div>

      {/* right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-3">Sign in</div>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-8">Welcome back</h2>

          <Tabs value={tab} onValueChange={(v) => { setTab(v); setError(""); }}>
            <TabsList className="grid grid-cols-2 w-full bg-[#111827] border border-[#1E293B] rounded-none p-0 h-auto">
              <TabsTrigger value="student" data-testid="tab-student" className="rounded-none data-[state=active]:bg-[#1E293B] data-[state=active]:text-white py-3 text-xs uppercase tracking-[0.2em]">
                <GraduationCap size={14} className="mr-2" /> Student
              </TabsTrigger>
              <TabsTrigger value="pcb" data-testid="tab-pcb" className="rounded-none data-[state=active]:bg-[#1E293B] data-[state=active]:text-white py-3 text-xs uppercase tracking-[0.2em]">
                <ShieldCheck size={14} className="mr-2" /> PPCB
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="mt-6">
              <p className="text-xs font-mono text-[#64748B]">Thapar Institute students &amp; registered users.</p>
            </TabsContent>
            <TabsContent value="pcb" className="mt-6">
              <p className="text-xs font-mono text-[#64748B]">Punjab Pollution Control Board officials only.</p>
            </TabsContent>
          </Tabs>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Email" testid="login-email" type="email" value={email} onChange={setEmail} placeholder={tab === "student" ? "you@thapar.edu" : "officer@ppcb.gov.in"} />
            <Field label="Password" testid="login-password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

            {error && <div data-testid="login-error" className="border border-red-500/40 bg-red-500/10 text-red-300 text-xs p-3 font-mono">{error}</div>}

            <button data-testid="login-submit" type="submit" disabled={loading} className="w-full h-12 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-[0.18em]">
              {loading ? "Signing in…" : <>Enter dashboard <ArrowRight size={16} /></>}
            </button>

            <button type="button" onClick={fillDemo} data-testid="login-demo-button" className="w-full h-10 border border-[#1E293B] hover:border-[#3B82F6] hover:bg-[#111827] transition-all text-[11px] uppercase tracking-[0.18em] text-[#94A3B8]">
              Use demo credentials
            </button>
          </form>

          {tab === "student" && (
            <div className="mt-8 text-xs font-mono text-[#64748B]">
              New here?{" "}
              <Link to="/register" data-testid="login-register-link" className="text-[#93C5FD] hover:text-white transition-colors">Register as student →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, testid, type, value, onChange, placeholder }) {
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
