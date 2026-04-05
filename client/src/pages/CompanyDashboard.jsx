import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaints } from "../services/complaints";
import { fetchDepartments } from "../services/department";
import { fetchUsers } from "../services/auth";

const CompanyDashboard = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      nav("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");

      const [complaintsRes, departmentsRes, usersRes] = await Promise.all([
        fetchComplaints(),
        fetchDepartments(),
        fetchUsers(),
      ]);

      if (!complaintsRes.success) {
        setError(complaintsRes.message || "Failed to load complaints");
      } else {
        setComplaints(complaintsRes.complaints || []);
      }

      if (!departmentsRes.success) {
        setError((prev) => prev || departmentsRes.message || "Failed to load departments");
      } else {
        setDepartments(departmentsRes.departments || []);
      }

      if (!usersRes.success) {
        setUsers([]);
        if (!usersRes.message?.includes("Not authenticated")) {
          setError((prev) => prev || "Unable to load user metrics for this account");
        }
      } else {
        setUsers(usersRes.users || []);
      }

      setLoading(false);
    };

    loadData();
  }, [nav]);

  const statusCounts = complaints.reduce((acc, complaint) => {
    const status = complaint.status || "pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const categoryCounts = complaints.reduce((acc, complaint) => {
    const category = complaint.category || "General";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const departmentCounts = complaints.reduce((acc, complaint) => {
    const id = complaint.department_id || "unassigned";
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const departmentMap = departments.reduce((acc, department) => {
    acc[department._id] = department.name;
    return acc;
  }, {});

  const topDepartments = Object.entries(departmentCounts)
    .sort(([, aCount], [, bCount]) => bCount - aCount)
    .slice(0, 4)
    .map(([id, count]) => ({
      name: id === "unassigned" ? "Unassigned" : departmentMap[id] || `Dept ${id.slice(0, 6)}`,
      count,
    }));

  const topCategories = Object.entries(categoryCounts)
    .sort(([, aCount], [, bCount]) => bCount - aCount)
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }));

  const resolvedStatuses = ["resolved", "approved_by_user", "completed"];
  const resolvedCount = resolvedStatuses.reduce(
    (sum, status) => sum + (statusCounts[status] || 0),
    0
  );
  const totalComplaints = complaints.length;
  const resolvedRate = totalComplaints ? Math.round((resolvedCount / totalComplaints) * 100) : 0;
  const openCount = totalComplaints - resolvedCount;
  const avgResolutionDays = complaints
    .filter((complaint) => resolvedStatuses.includes(complaint.status))
    .map((complaint) => {
      const started = new Date(complaint.createdAt);
      const finished = new Date(complaint.updatedAt || complaint.createdAt);
      return (finished - started) / 86400000;
    })
    .reduce((sum, days) => sum + days, 0);

  const avgResolutionTime = complaints.length
    ? Math.max(0, Math.round((avgResolutionDays / Math.max(1, complaints.filter((complaint) => resolvedStatuses.includes(complaint.status)).length)) * 10) / 10)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center py-24">
          <p className="text-lg text-slate-600">Loading company overview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Company Overview</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">Enterprise Complaint Pulse</h1>
              <p className="mt-4 max-w-2xl text-slate-600 leading-relaxed">
                Track company-wide performance, review department workload, and spot risk areas from a single dashboard.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-900 px-6 py-5 text-white shadow-lg">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">SLA Delivered</p>
              <p className="mt-3 text-4xl font-semibold">{resolvedRate}%</p>
              <p className="mt-2 text-sm text-slate-300">of complaints resolved on time</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700 mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500">Total Departments</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{departments.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500">Active Users</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{users.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500">Open Complaints</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{openCount}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-sm font-semibold text-slate-500">Avg. Resolution</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{avgResolutionTime || "—"}d</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr] mb-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-500">Complaint Status</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Company-wide ticket health</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {totalComplaints} tickets
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percent = totalComplaints ? Math.round((count / totalComplaints) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                      <span>{status.replace(/_/g, " ")}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-sky-500 to-indigo-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Top Departments</h2>
            <div className="space-y-4">
              {topDepartments.map((dept) => (
                <div key={dept.name} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{dept.name}</p>
                      <p className="text-sm text-slate-500">Complaint volume</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {dept.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr] mb-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Category Trends</h2>
            <div className="space-y-4">
              {topCategories.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                    <span>{category.name}</span>
                    <span>{category.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${Math.min(100, Math.round((category.count / Math.max(1, complaints.length)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Company Pulse</h2>
            <div className="space-y-4 text-slate-600 text-sm">
              <div>
                <p className="font-semibold text-slate-900">Leadership Focus</p>
                <p>Use company-level insights to reduce complaint turnaround time and raise citizen trust.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Operational Goals</p>
                <p>Align departments around response KPIs and overdue ticket reduction.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Next milestone</p>
                <p>Improve overall resolution rate by 8% before the next quarterly review.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
