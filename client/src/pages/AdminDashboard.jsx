import React,{ useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const nav = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "admin") {
      nav("/");
    }
  }, [nav]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, admin! Use the sidebar or links to manage users and data.</p>
    </div>
  );
};

export default AdminDashboard;
