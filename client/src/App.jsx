import React,{ useEffect, useState } from "react";
import Navbar from "./pages/Navbar";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import GoogleSuccess from "./pages/GoogleSuccess";
import { getCurrentUser } from "./services/auth";
import Profile from "./pages/Profile";
import AllComplaints from "./pages/AllComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import AnalyzerDashboard from "./pages/AnalyzerDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData.user || userData);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/complaint" element={<AllComplaints />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/analyzer" element={<AnalyzerDashboard />} />
          <Route path="/contractor" element={<ContractorDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
