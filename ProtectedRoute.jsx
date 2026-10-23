import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, checking } = useAuth();
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#64748B] font-mono text-sm">
        Initializing AirAura…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "pcb_official" ? "/pcb" : "/student"} replace />;
  }
  return children;
}
