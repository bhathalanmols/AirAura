import { Link } from "react-router-dom";
import Header from "../components/Header";
import { ArrowRight, Cpu, ChartLine, MapPin, ShieldCheck } from "@phosphor-icons/react";
import { AQI_SCALE } from "../lib/aqi";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Header />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 aa-grid-bg opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/6679353/pexels-photo-6679353.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/40 via-[#0B1120]/80 to-[#0B1120]" />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-24 lg:py-36">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 border border-[#1E293B] bg-[#111827] px-3 py-1 mb-8 text-[10px] uppercase tracking-[0.3em] text-[#93C5FD]" data-testid="hero-badge">
                <span className="w-1.5 h-1.5 bg-[#10B981] animate-pulse" />
                Live · Patiala &amp; Punjab Belt · 12 Stations
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter leading-[0.95]">
                Air that you breathe,<br />
                <span className="text-[#93C5FD]">measured to the block.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-[#94A3B8] text-base lg:text-lg leading-relaxed">
                AirAura is a hyper-locus air quality monitoring &amp; prediction platform built for the Punjab industrial belt — combining IoT sensors, regulatory datasets and ML forecasting into a single control plane for citizens and pollution authorities.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link to="/login" data-testid="hero-cta-login" className="inline-flex items-center gap-2 px-5 h-12 bg-[#3B82F6] hover:bg-[#2563EB] transition-colors text-sm uppercase tracking-[0.18em] font-medium">
                  Access Dashboard <ArrowRight size={16} />
                </Link>
                <Link to="/register" data-testid="hero-cta-register" className="inline-flex items-center gap-2 px-5 h-12 border border-[#1E293B] hover:border-[#3B82F6] hover:bg-[#111827] transition-all text-sm uppercase tracking-[0.18em]">
                  Register as Student
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-px bg-[#1E293B] border border-[#1E293B]">
              <StatCell value="12" label="Active stations" />
              <StatCell value="6" label="Pollutants tracked" />
              <StatCell value="24h" label="Trend window" />
              <StatCell value="7d" label="Forecast horizon" />
            </div>
          </div>
        </div>
      </section>

      {/* AQI scale */}
      <section className="border-y border-[#1E293B] bg-[#111827]/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
          <div className="flex items-baseline justify-between mb-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8]">AQI Scale Reference (US EPA)</div>
            <div className="text-xs font-mono text-[#64748B]">cpcb · ppcb compliant</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-[#1E293B] border border-[#1E293B]">
            {AQI_SCALE.map((s) => (
              <div key={s.label} className="bg-[#0B1120] p-5">
                <div className="w-8 h-1 mb-3" style={{ backgroundColor: s.color }} />
                <div className="font-display font-bold text-xl">{s.range}</div>
                <div className="text-xs uppercase tracking-widest text-[#94A3B8] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO LOGINS PITCH */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#94A3B8] mb-3">Built for two audiences</div>
        <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight max-w-3xl">
          One platform. <span className="text-[#94A3B8]">Two control planes.</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-px bg-[#1E293B] border border-[#1E293B] mt-12">
          <PitchCard
            tag="Thapar Student"
            title="Your air, your block."
            body="See live AQI from your home station, search any city across the Punjab belt, dig into 24h trends and get a 7-day forecast — plus actionable health tips tuned to today's reading."
            bullets={["Personal home station", "Search any monitored city", "24h trend + 7d forecast"]}
            icon={MapPin}
          />
          <PitchCard
            tag="PPCB Official"
            title="Region-wide command view."
            body="Watch every monitored station in a single grid. Identify pollution hotspots, compare clean vs. severe zones, and broadcast advisories to the citizens of affected districts."
            bullets={["Hotspot &amp; cleanest tracking", "Issue official advisories", "Bucketed regional AQI mix"]}
            icon={ShieldCheck}
          />
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="border-y border-[#1E293B] bg-[#111827]/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-3 gap-px bg-[#1E293B] border border-[#1E293B]">
          <Feature icon={Cpu} title="Hyper-locus sensing" body="ESP32-grade sensor nodes deployed across academic, urban and industrial zones." />
          <Feature icon={ChartLine} title="ML forecasting" body="Trend-driven 7-day AQI forecast trained on regulatory + IoT pollution datasets." />
          <Feature icon={ShieldCheck} title="Public-health first" body="Category-aware health recommendations for sensitive groups, students and elderly." />
        </div>
      </section>

      <footer className="border-t border-[#1E293B]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#64748B]">
          <div>AirAura · Capstone Project CPG-192 · TIET Patiala</div>
          <div>© 2026 · Mentor: Dr. Chinmaya Panigrahy &amp; Dr. Garima Singh</div>
        </div>
      </footer>
    </div>
  );
}

function StatCell({ value, label }) {
  return (
    <div className="bg-[#0B1120] p-6">
      <div className="font-display font-bold text-3xl">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#64748B] mt-2">{label}</div>
    </div>
  );
}

function PitchCard({ tag, title, body, bullets, icon: Icon }) {
  return (
    <div className="bg-[#0B1120] p-8 lg:p-10">
      <div className="flex items-center gap-2 mb-6">
        <Icon size={16} className="text-[#3B82F6]" />
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#93C5FD]">{tag}</div>
      </div>
      <h3 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">{title}</h3>
      <p className="text-[#94A3B8] mt-4 leading-relaxed">{body}</p>
      <ul className="mt-6 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-3 text-sm text-[#E2E8F0]">
            <span className="w-1 h-1 bg-[#3B82F6]" />
            <span dangerouslySetInnerHTML={{ __html: b }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Feature({ icon: Icon, title, body }) {
  return (
    <div className="bg-[#0B1120] p-8">
      <Icon size={20} className="text-[#93C5FD] mb-4" />
      <div className="font-display font-bold text-lg">{title}</div>
      <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
