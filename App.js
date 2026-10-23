import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import StudentExplore from "./pages/StudentExplore";
import LocationDetail from "./pages/LocationDetail";
import PCBDashboard from "./pages/PCBDashboard";
import PCBStations from "./pages/PCBStations";
import PCBAdvisories from "./pages/PCBAdvisories";
import "./App.css";

function RootRedirect() {
  const { user, checking } = useAuth();
  if (checking) return null;
  if (!user) return <Landing />;
  return <Navigate to={user.role === "pcb_official" ? "/pcb" : "/student"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/explore" element={<ProtectedRoute role="student"><StudentExplore /></ProtectedRoute>} />

          <Route path="/pcb" element={<ProtectedRoute role="pcb_official"><PCBDashboard /></ProtectedRoute>} />
          <Route path="/pcb/stations" element={<ProtectedRoute role="pcb_official"><PCBStations /></ProtectedRoute>} />
          <Route path="/pcb/advisories" element={<ProtectedRoute role="pcb_official"><PCBAdvisories /></ProtectedRoute>} />

          <Route path="/location/:id" element={<ProtectedRoute><LocationDetail /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

