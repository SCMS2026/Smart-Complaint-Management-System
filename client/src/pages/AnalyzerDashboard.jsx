import React,{ useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AnalyzerDashboard = () => {
  const nav = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "analyzer") {
      nav("/");
    }
  }, [nav]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analyzer Panel</h1>
      <p>Welcome, analyst! Access complaint analytics and reports here.</p>
    </div>
  );
};

export default AnalyzerDashboard;
