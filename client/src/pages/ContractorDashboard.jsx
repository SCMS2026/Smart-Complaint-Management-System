import React,{ useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ContractorDashboard = () => {
  const nav = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "contractor") {
      nav("/");
    }
  }, [nav]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contractor Panel</h1>
      <p>Welcome, contractor! View assignments and update complaint statuses here.</p>
    </div>
  );
};

export default ContractorDashboard;
