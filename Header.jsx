import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Wind, SignOut, User, ShieldCheck } from "@phosphor-icons/react";

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const handleLogout = () => { logout(); nav("/"); };

  const isPCB = user && user.role === "pcb_official";

  return (
    <header
      data-testid="app-header"
      className="sticky top-0 z-40 bg-[#0B1120]/75 backdrop-blur-xl backdrop-saturate-150 border-b border-[#1E293B]"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to={user ? (isPCB ? "/pcb" : "/student") : "/"} className="flex items-center gap-3 group" data-testid="logo-link">
          <div className="w-8 h-8 border border-[#3B82F6] flex items-center justify-center bg-[#3B82F6]/10">
            <Wind size={18} weight="duotone" className="text-[#93C5FD]" />
          </div>
          <div className="font-display font-bold tracking-tight text-[15px]">
            AirAura
            <span className="ml-2 text-[10px] tracking-[0.25em] uppercase text-[#64748B]">v0.1</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {user && isPCB && (
            <>
              <NavLink to="/pcb" active={loc.pathname === "/pcb"} testid="nav-overview">Overview</NavLink>
              <NavLink to="/pcb/stations" active={loc.pathname.startsWith("/pcb/stations")} testid="nav-stations">Stations</NavLink>
              <NavLink to="/pcb/advisories" active={loc.pathname.startsWith("/pcb/advisories")} testid="nav-advisories">Advisories</NavLink>
            </>
          )}
          {user && !isPCB && (
            <>
              <NavLink to="/student" active={loc.pathname === "/student"} testid="nav-dashboard">Dashboard</NavLink>
              <NavLink to="/student/explore" active={loc.pathname.startsWith("/student/explore")} testid="nav-explore">Explore</NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#1E293B] bg-[#111827]">
                {isPCB ? <ShieldCheck size={14} className="text-[#93C5FD]" /> : <User size={14} className="text-[#93C5FD]" />}
                <span className="text-xs font-mono text-[#94A3B8]" data-testid="user-name">{user.name}</span>
              </div>
              <button
                data-testid="logout-button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1E293B] hover:border-[#3B82F6] hover:bg-[#1E293B] transition-all duration-200 text-xs uppercase tracking-wider"
              >
                <SignOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="header-login-link" className="px-3 py-1.5 text-xs uppercase tracking-wider hover:text-[#93C5FD] transition-colors">
                Login
              </Link>
              <Link to="/register" data-testid="header-register-link" className="px-3 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs uppercase tracking-wider transition-colors">
                Get Access
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, children, testid }) {
  return (
    <Link
      to={to}
      data-testid={testid}
      className={`px-3 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-200 border-b-2 ${
        active
          ? "border-[#3B82F6] text-white"
          : "border-transparent text-[#94A3B8] hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
