import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaintAnalytics } from "../services/complaints";

const AnalyzerDashboard = () => {
  const nav = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "analyzer") {
      nav("/");
      return;
    }

    const loadAnalytics = async () => {
      setLoading(true);
      const res = await fetchComplaintAnalytics();
      if (res.success) {
        setAnalytics(res.analytics);
      } else {
        setError(res.message);
      }
      setLoading(false);
    };

    loadAnalytics();
  }, [nav]);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Analyzer Panel</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Analyzer Panel</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const formatCount = (items) => items.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analyzer Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-600">Total Complaints</h2>
          <p className="text-3xl font-bold">{analytics.totalComplaints || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-600">Open Complaints</h2>
          <p className="text-3xl font-bold">{analytics.statusBreakdown?.find((s) => s._id === "pending")?.count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-600">In Progress</h2>
          <p className="text-3xl font-bold">{analytics.statusBreakdown?.find((s) => s._id === "in_progress")?.count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-gray-600">Resolved</h2>
          <p className="text-3xl font-bold">{formatCount(analytics.statusBreakdown.filter((s) => ["completed","approved_by_user"].includes(s._id)))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-3">Status Breakdown</h3>
          <ul className="text-sm space-y-1">
            {analytics.statusBreakdown?.map((item) => (
              <li key={item._id} className="flex justify-between">
                <span>{item._id || "Unknown"}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-3">Top Categories</h3>
          <ul className="text-sm space-y-1">
            {analytics.categoryBreakdown?.map((item) => (
              <li key={item._id} className="flex justify-between">
                <span>{item._id || "Other"}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="font-bold mb-3">Recent Trend (complaints per day)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {analytics.dailyTrend?.map((row) => (
                <tr key={row._id} className="border-b">
                  <td className="py-1">{row._id}</td>
                  <td className="py-1">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyzerDashboard;
