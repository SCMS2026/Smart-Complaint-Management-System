import { useEffect, useState } from "react";
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
        setAnalytics(res.analytics || {});
      } else {
        setError(res.message || "Unable to load analytics.");
      }
      setLoading(false);
    };

    loadAnalytics();
  }, [nav]);

  const totalResolved = () => {
    if (!analytics?.statusBreakdown) return 0;
    return analytics.statusBreakdown.reduce((sum, item) => {
      if (["completed", "approved_by_user", "resolved"].includes(item._id)) return sum + item.count;
      return sum;
    }, 0);
  };

  const statusValue = (statusId) => analytics?.statusBreakdown?.find((item) => item._id === statusId)?.count || 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-4xl bg-linear-to-r from-slate-900 to-slate-800 text-white p-10 shadow-xl mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Analytics Workspace</p>
          <h1 className="mt-4 text-4xl font-bold">Analyzer Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300 leading-7">Monitor complaint trends and breakdowns using real-time analytics data.</p>
        </div>

        {loading ? (
          <div className="rounded-[1.75rem] bg-white p-12 shadow-sm text-center text-slate-500">Loading analytics…</div>
        ) : error ? (
          <div className="rounded-[1.75rem] bg-white p-12 shadow-sm text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total Complaints</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{analytics?.totalComplaints || 0}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Pending</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{statusValue("pending")}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">In Progress</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{statusValue("in_progress")}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Resolved</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{totalResolved()}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2 mb-6">
              <div className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Status Breakdown</h2>
                <ul className="space-y-3 text-sm text-slate-700">
                  {analytics?.statusBreakdown?.map((item) => (
                    <li key={item._id} className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <span>{item._id || "Unknown"}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Top Categories</h2>
                <ul className="space-y-3 text-sm text-slate-700">
                  {analytics?.categoryBreakdown?.map((item) => (
                    <li key={item._id} className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <span>{item._id || "Other"}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Daily Trend</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.dailyTrend || []).map((row) => (
                      <tr key={row._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">{row._id}</td>
                        <td className="px-4 py-3">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyzerDashboard;
