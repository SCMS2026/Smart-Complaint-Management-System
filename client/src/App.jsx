import React, { useEffect, useState } from "react";
import Navbar from "./pages/Navbar";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GoogleSuccess from "./pages/GoogleSuccess";
import { getCurrentUser } from "./services/auth";

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
      <main className="container">
        <Routes>
          <Route path="/" element={<Navbar user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
