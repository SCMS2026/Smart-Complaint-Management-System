import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../services/apiConfig";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/department";
import { fetchUsers, createUser, setUserRole, getToken } from "../services/auth";
import { fetchComplaints } from "../services/complaints";
import { fetchWorkerTasks } from "../services/workerTask";
import { useTheme } from "../context/ThemeContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

/* ── helpers ── */
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
const API_AUTH = `${API_URL}/auth`;

const deleteUser = async (id) => {
  const token = getToken();
  const res = await fetch(`${API_AUTH}/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  return res.ok ? { success: true } : { success: false, message: data.message };
};

const ROLE_COLORS = {
  super_admin: "bg-violet-100 text-violet-700",
  department_admin: "bg-blue-100 text-blue-700",
  worker: "bg-emerald-100 text-emerald-700",
  analyzer: "bg-amber-100 text-amber-700",
  contractor: "bg-orange-100 text-orange-700",
  user: "bg-slate-100 text-slate-600",
};

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Fetch analytics
const fetchAnalytics = async () => {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/complaints/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return { success: true, analytics: await res.json() };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const STATUS_CONFIG = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200" },
  verified: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  in_progress: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", border: "border-red-200" },
  user_approval_pending: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200" },
  approved_by_user: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500", border: "border-teal-200" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400", border: "border-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status?.replace(/_/g, " ") || "unknown"}
    </span>
  );
};

/* ── Modal ── */
const Modal = ({ title, onClose, onSubmit, submitLabel, danger, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xl transition">&times;</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="px-6 py-5 space-y-4">{children}</div>
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">Cancel</button>
          <button type="submit" className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition ${danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

/* ═══════════════════════════ MAIN ═══════════════════════════ */
const SuperAdminDashboard = () => {
  const nav = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [workerTasks, setWorkerTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Get current user for role checks
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Modals
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "", department_id: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "super_admin") { nav("/"); return; }
    loadAll();
  }, [nav]);

  const loadAll = async () => {
    setLoading(true);
    const [d, u, c, w, a] = await Promise.all([fetchDepartments(), fetchUsers(), fetchComplaints(), fetchWorkerTasks(), fetchAnalytics()]);
    if (d.success) setDepartments(d.departments || []);
    if (u.success) setUsers(u.users || []);
    if (c.success) setComplaints(c.complaints || []);
    if (w.success) setWorkerTasks(w.workerTasks || []);
    if (a.success) setAnalytics(a.analytics || null);
    setLoading(false);
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(""), 5000); };

  // Dept CRUD
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (editingDept) {
      const r = await updateDepartment(editingDept._id, deptForm);
      if (r.success) { setDepartments(departments.map(d => d._id === editingDept._id ? r.department : d)); setEditingDept(null); setDeptForm({ name: "", description: "" }); showSuccess("Department updated!"); }
      else showError(r.message);
    } else {
      const r = await createDepartment(deptForm);
      if (r.success) { setDepartments([...departments, r.department]); setShowDeptForm(false); setDeptForm({ name: "", description: "" }); showSuccess("Department created!"); }
      else showError(r.message);
    }
  };

  const handleDeptDelete = async () => {
    const r = await deleteDepartment(deleteConfirm.id);
    if (r.success) { setDepartments(departments.filter(d => d._id !== deleteConfirm.id)); setDeleteConfirm(null); showSuccess("Department deleted."); }
    else showError(r.message);
  };

  // User CRUD
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userForm.role === "department_admin" && !userForm.department_id) { showError("Department is required for department admin"); return; }
    const r = await createUser(userForm);
    if (r.success) { setUsers([...users, r.user]); setShowUserForm(false); setUserForm({ name: "", email: "", password: "", role: "", department_id: "" }); showSuccess("User created!"); }
    else showError(r.message);
  };

  const handleRoleChange = async (userId, role, deptId) => {
    const r = await setUserRole(userId, role, deptId);
    if (r.success) setUsers(users.map(u => u._id === userId ? r.user : u));
    else showError(r.message);
  };

  const handleUserDelete = async () => {
    const r = await deleteUser(deleteConfirm.id);
    if (r.success) { setUsers(users.filter(u => u._id !== deleteConfirm.id)); setDeleteConfirm(null); showSuccess("User deleted."); }
    else showError(r.message);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const token = getToken();
    const res = await fetch(`${API_AUTH}/admin/users/${userId}/toggle-status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setUsers(users.map(u => u._id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
      showSuccess(`User ${data.user.status === 'active' ? 'unblocked' : 'blocked'}`);
    } else {
      showError(data.message || 'Failed to toggle status');
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} selected users? This cannot be undone.`)) return;
    const token = getToken();
    const res = await fetch(`${API_AUTH}/admin/users/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds: selectedUsers }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setUsers(users.filter(u => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
      showSuccess(`${data.deletedCount} users deleted`);
    } else {
      showError(data.message || 'Bulk delete failed');
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'} font-medium`}>Loading Mission Control…</p>
      </div>
    </div>
  );

  const stats = {
    departments: departments.length,
    users: users.length,
    complaints: complaints.length,
    resolved: complaints.filter(c => ["completed", "approved_by_user"].includes(c.status)).length,
    pending: complaints.filter(c => c.status === "pending").length,
    workers: users.filter(u => u.role === "worker").length,
    deptAdmins: users.filter(u => u.role === "department_admin").length,
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: "⬡" },
    { id: "departments", label: "Departments", icon: "🏢" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "complaints", label: "Complaints", icon: "📋" },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-[#f8f9fc]'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 shadow-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} border-b`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">SA</div>
            <div>
              <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} leading-none`}>Mission Control</p>
              <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'} mt-0.5`}>Super Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab Nav */}
            <nav className={`hidden md:flex items-center gap-1 rounded-xl p-1 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === t.id ? (theme === 'dark' ? 'bg-slate-600 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}>
                  {t.label}
                </button>
              ))}
            </nav>
            {/* <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button> */}
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${theme === 'dark' ? 'bg-violet-900/50 text-violet-300 border border-violet-700' : 'bg-violet-50 text-violet-600 border border-violet-100'}`}>SUPER ADMIN</span>
          </div>
        </div>
      </header>

      {/* Toasts */}
      {(error || success) && (
        <div className="fixed top-16 right-4 z-50 space-y-2">
          {error && (
            <div className="flex items-center gap-3 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
              <span>⚠ {error}</span>
              <button onClick={() => setError("")} className="ml-2 opacity-70 hover:opacity-100">&times;</button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-emerald-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
              <span>✓ {success}</span>
            </div>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-1`}>System Overview</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'} mb-8`}>Real-time snapshot of all departments, users & complaints</p>

            {/* Stat Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Departments", value: stats.departments, icon: "🏢", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                { label: "Total Users", value: stats.users, icon: "👥", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                { label: "Complaints", value: stats.complaints, icon: "📋", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                { label: "Resolved", value: stats.resolved, icon: "✅", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
                  <p className="text-2xl mb-2">{s.icon}</p>
                  <p className={`text-3xl font-bold ${s.color} leading-none`}>{s.value}</p>
                  <p className={`text-xs font-semibold mt-1 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-600' : 'text-slate-500'}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Status Breakdown Pie Chart */}
              <div className={`rounded-2xl border shadow-sm p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Status Breakdown</h3>
                {analytics?.statusBreakdown && analytics.statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.statusBreakdown}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name.replace(/_/g, ' ')} ${(percent * 100).toFixed(0)}%`}
                      >
                        {analytics.statusBreakdown.map((entry, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400">No data available</div>
                )}
              </div>

              {/* Daily Trend Line Chart */}
              <div className={`rounded-2xl border shadow-sm p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Daily Complaint Trend</h3>
                {analytics?.dailyTrend && analytics.dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#E2E8F0'} />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} />
                      <YAxis tick={{ fontSize: 11 }} stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400">No data available</div>
                )}
              </div>
            </div>

            {/* Department Performance Bar Chart (admin+ only) */}
            {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && analytics?.departmentBreakdown && analytics.departmentBreakdown.length > 0 && (
              <div className={`rounded-2xl border shadow-sm p-6 mt-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <h3 className={`font-semibold mb-4 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Department Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.departmentBreakdown.map(d => ({
                    name: d._id.departmentName || 'Unassigned',
                    total: d.total,
                    pending: d.pending,
                    inProgress: d.inProgress,
                    completed: d.completed
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#E2E8F0'} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} />
                    <YAxis tick={{ fontSize: 11 }} stroke={theme === 'dark' ? '#94A3B8' : '#64748B'} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#10B981" name="Completed" />
                    <Bar dataKey="inProgress" fill="#8B5CF6" name="In Progress" />
                    <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
               </div>
             )}
           </div>
         )}

         {/* ── DEPARTMENTS TAB ── */}
        {activeTab === "departments" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
                <p className="text-sm text-slate-400 mt-0.5">{departments.length} departments in system</p>
              </div>
              <button onClick={() => { setShowDeptForm(true); setEditingDept(null); setDeptForm({ name: "", description: "" }); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                + Add Department
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Complaints</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-300">No departments yet</td></tr>
                  ) : departments.map(dept => {
                    const deptComplaints = complaints.filter(c => (c.department_id?._id || c.department_id) === dept._id);
                    return (
                      <tr key={dept._id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                              {dept.name[0]?.toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800">{dept.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400 max-w-[200px] truncate">{dept.description || "—"}</td>
                        <td className="px-6 py-4">
                          {dept.admin ? (
                            <span className="flex items-center gap-1.5 text-sm text-slate-700">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">{initials(dept.admin.name)}</span>
                              {dept.admin.name}
                            </span>
                          ) : <span className="text-xs text-slate-300 italic">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-700">{deptComplaints.length}</span>
                          <span className="text-xs text-slate-400 ml-1">total</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(dept.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditingDept(dept); setDeptForm({ name: dept.name, description: dept.description || "" }); setShowDeptForm(true); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition">Edit</button>
                            <button onClick={() => setDeleteConfirm({ type: "dept", id: dept._id, name: dept.name })}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="text-sm text-slate-400 mt-0.5">{users.length} users registered</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowUserForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                  + Add User
                </button>
                {selectedUsers.length > 0 && (
                  <button onClick={handleBulkDeleteUsers}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                    🗑 Delete Selected ({selectedUsers.length})
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(users.map(u => u._id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-300">No users yet</td></tr>
                  ) : users.map(user => {
                    const deptId = user.department && typeof user.department === "object" ? user.department._id : user.department || "";
                    const isSelected = selectedUsers.includes(user._id);
                    return (
                      <tr key={user._id} className={`border-t border-slate-50 hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user._id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {initials(user.name)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{user.name}</p>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user.role] || "bg-slate-100 text-slate-500"}`}>
                                {user.role?.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <select
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            value={user.role}
                            onChange={e => handleRoleChange(user._id, e.target.value, deptId)}
                            disabled={user._id === currentUser?._id}
                          >
                            {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                              <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className={`text-xs px-2 py-1 rounded-full font-medium transition ${user.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            disabled={user._id === currentUser?._id}
                          >
                            {user.status === 'active' ? 'Active' : 'Blocked'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            value={deptId}
                            onChange={e => handleRoleChange(user._id, user.role, e.target.value)}
                          >
                            <option value="">None</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setDeleteConfirm({ type: "user", id: user._id, name: user.name })}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === "complaints" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">All Complaints</h1>
                <p className="text-sm text-slate-400 mt-0.5">{complaints.length} total complaints system-wide</p>
              </div>
              <div className="flex gap-2">
                {["pending", "verified", "in_progress", "completed"].map(s => (
                  <span key={s} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
                    {s.replace(/_/g, " ")}: {complaints.filter(c => c.status === s).length}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Worker</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-300">No complaints found</td></tr>
                  ) : complaints.map(c => {
                    const task = workerTasks.find(t => t.complaint_id === c._id || t.complaint_id?._id === c._id);
                    const workerName = task?.worker_id?.name || task?.worker?.name || "—";
                    return (
                      <tr key={c._id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5"><span className="font-mono text-xs text-slate-400">#{c._id?.slice(-6)}</span></td>
                        <td className="px-6 py-3.5"><span className="text-sm text-slate-700 font-medium block max-w-[180px] truncate">{c.issue || "—"}</span></td>
                        <td className="px-6 py-3.5"><StatusBadge status={c.status} /></td>
                        <td className="px-6 py-3.5 text-sm text-slate-500">{c.department_id?.name || <span className="text-slate-300 italic">Unassigned</span>}</td>
                        <td className="px-6 py-3.5 text-sm text-slate-500">{c.userId?.name || "—"}</td>
                        <td className="px-6 py-3.5 text-sm text-slate-500">{workerName}</td>
                        <td className="px-6 py-3.5 text-xs text-slate-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Create/Edit Dept Modal ── */}
      {showDeptForm && (
        <Modal
          title={editingDept ? "Edit Department" : "Create Department"}
          submitLabel={editingDept ? "Update" : "Create"}
          onClose={() => { setShowDeptForm(false); setEditingDept(null); setDeptForm({ name: "", description: "" }); }}
          onSubmit={handleDeptSubmit}>
          <Field label="Department Name">
            <input type="text" required className={inputCls} value={deptForm.name}
              onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="e.g. Water Supply" />
          </Field>
          <Field label="Description">
            <textarea rows={3} className={inputCls + " resize-none"} value={deptForm.description}
              onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Brief description…" />
          </Field>
        </Modal>
      )}

      {/* ── Create User Modal ── */}
      {showUserForm && (
        <Modal title="Create New User" submitLabel="Create User"
          onClose={() => { setShowUserForm(false); setUserForm({ name: "", email: "", password: "", role: "", department_id: "" }); }}
          onSubmit={handleUserSubmit}>
          <Field label="Full Name">
            <input type="text" required className={inputCls} value={userForm.name}
              onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" required className={inputCls} value={userForm.email}
              onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
          </Field>
          <Field label="Password">
            <input type="password" required className={inputCls} value={userForm.password}
              onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
          </Field>
          <Field label="Role">
            <select required className={inputCls + " cursor-pointer"} value={userForm.role}
              onChange={e => setUserForm({ ...userForm, role: e.target.value, department_id: e.target.value === "department_admin" ? userForm.department_id : "" })}>
              <option value="">Select role…</option>
              {["department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Department (required for dept admin)">
            <select className={inputCls + " cursor-pointer"} value={userForm.department_id}
              onChange={e => setUserForm({ ...userForm, department_id: e.target.value })}>
              <option value="">None</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <Modal
          title={`Delete ${deleteConfirm.type === "user" ? "User" : "Department"}?`}
          submitLabel="Yes, Delete"
          danger
          onClose={() => setDeleteConfirm(null)}
          onSubmit={e => { e.preventDefault(); deleteConfirm.type === "user" ? handleUserDelete() : handleDeptDelete(); }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-800">"{deleteConfirm.name}"</strong>?
              {deleteConfirm.type === "dept" && " All associated data may be affected."}
              {" "}This action cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SuperAdminDashboard;