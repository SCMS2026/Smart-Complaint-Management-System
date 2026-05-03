import { useEffect, useState } from "react";
import Navbar from "./pages/Navbar";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import "./index.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import GoogleSuccess from "./pages/GoogleSuccess";
import { getCurrentUser } from "./services/auth";
import Profile from "./pages/Profile";
import AllComplaints from "./pages/AllComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import AnalyzerDashboard from "./pages/AnalyzerDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import ContractorDashboard from "./pages/WorkerDashboard";
import DepartmentAdminDashboard from "./pages/DepartmentAdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import PropertiesList from "./pages/PropertiesList";
import PermissionRequests from "./pages/PermissionRequests";
import ComplaintTracking from "./pages/ComplaintTracking";
import Analytics from "./pages/Analytics";
import Resources from "./pages/Resources";

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      // 1. Load from localStorage instantly (no flicker)
      const cached = localStorage.getItem("user");
      if (cached) {
        try { setUser(JSON.parse(cached)); } catch {}
      }
      // 2. Verify token with server
      const token = localStorage.getItem("user_token");
      if (!token) { setLoading(false); return; }

      const userData = await getCurrentUser();
      if (userData) {
        const u = userData.user || userData;
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      } else {
        // Token invalid/expired - clear so user sees login
        localStorage.removeItem("user_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/complaint" element={<AllComplaints />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/department-admin" element={<DepartmentAdminDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/analyzer" element={<AnalyzerDashboard />} />
          <Route path="/contractor" element={<ContractorDashboard />} />
          <Route path="/contractor/properties" element={<PropertiesList />} />
          <Route path="/contractor/permissions" element={<PermissionRequests />} />
          <Route path="/track" element={<ComplaintTracking />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;