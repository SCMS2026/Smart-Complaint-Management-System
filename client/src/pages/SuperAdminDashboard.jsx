import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../services/apiConfig";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/department";
import { fetchUsers, createUser, setUserRole, getToken } from "../services/auth";
import { fetchComplaints } from "../services/complaints";
import { fetchWorkerTasks } from "../services/workerTask";
import { useTheme } from "../context/ThemeContext";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { Users, Building2, SquareKanban, NotepadText, CircleCheck,Pencil,Trash } from "lucide-react";

/* ─── helpers ─── */
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const API_AUTH = `${API_URL}/auth`;

const deleteUser = async (id) => {
  const token = getToken();
  const res = await fetch(`${API_AUTH}/admin/users/${id}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  return res.ok ? { success: true } : { success: false, message: data.message };
};

const fetchAnalytics = async () => {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/complaints/analytics`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error();
    return { success: true, analytics: await res.json() };
  } catch { return { success: false }; }
};

/* ─── config ─── */
const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

const STATUS_CFG = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200", label: "Pending" },
  verified: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200", label: "Verified" },
  in_progress: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200", label: "In Progress" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200", label: "Completed" },
  rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", border: "border-red-200", label: "Rejected" },
  user_approval_pending: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200", label: "Awaiting Approval" },
  approved_by_user: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500", border: "border-teal-200", label: "Approved" },
  rejected_by_user: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400", border: "border-rose-200", label: "Rejected by User" },
};

const ROLE_CLR = {
  super_admin: "bg-violet-100 text-violet-700 border-violet-200",
  department_admin: "bg-blue-100 text-blue-700 border-blue-200",
  worker: "bg-emerald-100 text-emerald-700 border-emerald-200",
  analyzer: "bg-amber-100 text-amber-700 border-amber-200",
  contractor: "bg-orange-100 text-orange-700 border-orange-200",
  user: "bg-slate-100 text-slate-600 border-slate-200",
};

const DEPT_GRAD = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-500",
];

const TABS = [
  { id: "overview", label: "Overview", icon: <SquareKanban /> },
  { id: "departments", label: "Departments", icon: <Building2 /> },
  { id: "users", label: "Users", icon: <Users /> },
  { id: "complaints", label: "Complaints", icon: <NotepadText /> },
];

/* ─── tiny components ─── */
const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400", border: "border-slate-200", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

const Avatar = ({ name, src, size = "md" }) => {
  const s = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" }[size];
  if (src) return <img src={src} alt="" className={`${s} rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-700`} />;
  return (
    <div className={`${s} rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white dark:ring-slate-700`}>
      {initials(name)}
    </div>
  );
};

/* dark-aware card & text helpers passed via `dk` bool */
const card = (dk) => `rounded-2xl border shadow-sm ${dk ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`;
const heading = (dk) => `font-black ${dk ? "text-white" : "text-slate-900"}`;
const sub = (dk) => `text-sm ${dk ? "text-slate-400" : "text-slate-400"}`;
const tableHead = (dk) => `text-[10px] font-black uppercase tracking-widest ${dk ? "text-slate-500" : "text-slate-400"}`;
const tableRow = (dk) => `border-t transition-colors ${dk ? "border-slate-700 hover:bg-slate-700/40" : "border-slate-50 hover:bg-slate-50/60"}`;

/* ─── Modal ─── */
const Modal = ({ title, onClose, onSubmit, submitLabel, danger, dk, children }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm">
    <div className={`rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden ${dk ? "bg-slate-800" : "bg-white"}`}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${dk ? "border-slate-700" : "border-slate-100"}`}>
        <h3 className={`font-bold text-sm ${dk ? "text-white" : "text-slate-800"}`}>{title}</h3>
        <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full text-xl transition ${dk ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}>×</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">{children}</div>
        <div className={`flex justify-end gap-2 px-6 pb-6 pt-2 border-t ${dk ? "border-slate-700" : "border-slate-50"}`}>
          <button type="button" onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${dk ? "text-slate-300 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"}`}>
            Cancel
          </button>
          <button type="submit"
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-sm ${danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Field = ({ label, required, dk, children }) => (
  <div>
    <label className={`block text-[11px] font-bold uppercase tracking-widest mb-2 ${dk ? "text-slate-400" : "text-slate-400"}`}>
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = (dk) =>
  `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition placeholder-slate-400
  ${dk
    ? "bg-slate-700 border-slate-600 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-900/40"
    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"}`;

/* ═══════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════ */
const SuperAdminDashboard = () => {
  const nav = useNavigate();
  const { theme } = useTheme();
  const dk = theme === "dark";

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [workerTasks, setWorkerTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [searchComplaints, setSearchComplaints] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  /* modals */
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "", department_id: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.role !== "super_admin") { nav("/"); return; }
    loadAll();
  }, [nav]);

  const loadAll = async () => {
    setLoading(true);
    const [d, u, c, w, a] = await Promise.all([
      fetchDepartments(), fetchUsers(), fetchComplaints({ limit: 1000 }),
      fetchWorkerTasks(), fetchAnalytics(),
    ]);
    if (d.success) setDepartments(d.departments || []);
    if (u.success) setUsers(u.users || []);
    if (c.success) setComplaints(c.complaints || []);
    if (w.success) setWorkerTasks(w.workerTasks || []);
    if (a.success) setAnalytics(a.analytics || null);
    setLoading(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* handlers */
  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    if (editingDept) {
      const r = await updateDepartment(editingDept._id, deptForm);
      if (r.success) { setDepartments(departments.map(d => d._id === editingDept._id ? r.department : d)); showToast("Department updated"); }
      else showToast(r.message, "error");
    } else {
      const r = await createDepartment(deptForm);
      if (r.success) { setDepartments([...departments, r.department]); showToast("Department created"); }
      else showToast(r.message, "error");
    }
    setShowDeptForm(false); setEditingDept(null); setDeptForm({ name: "", description: "" });
  };

  const handleDeptDelete = async () => {
    const r = await deleteDepartment(deleteConfirm.id);
    if (r.success) { setDepartments(departments.filter(d => d._id !== deleteConfirm.id)); showToast("Department deleted"); }
    else showToast(r.message, "error");
    setDeleteConfirm(null);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userForm.role === "department_admin" && !userForm.department_id) { showToast("Department required for dept admin", "error"); return; }
    const r = await createUser(userForm);
    if (r.success) { setUsers([...users, r.user]); showToast("User created"); }
    else showToast(r.message, "error");
    setShowUserForm(false); setUserForm({ name: "", email: "", password: "", role: "", department_id: "" });
  };

  const handleRoleChange = async (userId, role, deptId) => {
    const r = await setUserRole(userId, role, deptId);
    if (r.success) setUsers(users.map(u => u._id === userId ? r.user : u));
    else showToast(r.message, "error");
  };

  const handleUserDelete = async () => {
    const r = await deleteUser(deleteConfirm.id);
    if (r.success) { setUsers(users.filter(u => u._id !== deleteConfirm.id)); showToast("User deleted"); }
    else showToast(r.message, "error");
    setDeleteConfirm(null);
  };

  const handleToggleStatus = async (userId) => {
    const token = getToken();
    const res = await fetch(`${API_AUTH}/admin/users/${userId}/toggle-status`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setUsers(users.map(u => u._id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
      showToast(`User ${data.user?.status === "active" ? "unblocked" : "blocked"}`);
    } else showToast(data.message || "Failed", "error");
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} users? Cannot be undone.`)) return;
    const token = getToken();
    const res = await fetch(`${API_AUTH}/admin/users/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userIds: selectedUsers }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) { setUsers(users.filter(u => !selectedUsers.includes(u._id))); setSelectedUsers([]); showToast(`${data.deletedCount} users deleted`); }
    else showToast(data.message || "Bulk delete failed", "error");
  };

  /* computed */
  const stats = {
    departments: departments.length,
    users: users.length,
    complaints: complaints.length,
    resolved: complaints.filter(c => ["completed", "approved_by_user"].includes(c.status)).length,
    pending: complaints.filter(c => c.status === "pending").length,
    workers: users.filter(u => u.role === "worker").length,
  };

  const filteredUsers = users.filter(u => {
    const q = searchUsers.toLowerCase();
    return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) &&
      (filterRole === "all" || u.role === filterRole);
  });

  const filteredComplaints = complaints.filter(c =>
    (c.issue || "").toLowerCase().includes(searchComplaints.toLowerCase()) &&
    (filterStatus === "all" || c.status === filterStatus)
  );

  /* tooltip style for charts */
  const tooltipStyle = {
    borderRadius: 12, border: "none",
    boxShadow: "0 4px 24px rgba(0,0,0,.15)",
    backgroundColor: dk ? "#1e293b" : "#fff",
    color: dk ? "#e2e8f0" : "#0f172a",
  };
  const axisColor = dk ? "#64748b" : "#94a3b8";
  const gridColor = dk ? "#334155" : "#f1f5f9";

  /* ── loading ── */
  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dk ? "bg-slate-900" : "bg-[#f5f6fa]"}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className={`text-sm font-semibold ${dk ? "text-slate-400" : "text-slate-400"}`}>Loading Mission Control…</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 md:pb-0 transition-colors duration-300 ${dk ? "bg-slate-900" : "bg-[#f5f6fa]"}`}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-20 right-4 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-white shadow-xl transition-all
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.type === "error" ? "⚠" : "✓"} {toast.msg}
          <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* ── Header / secondary nav ── */}
      <div className={`sticky top-0 z-30 border-b shadow-sm ${dk ? "bg-slate-800/95 border-slate-700 backdrop-blur-md" : "bg-white/95 border-slate-100 backdrop-blur-md"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4 py-2">
          {/* Brand chip */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[11px] font-black shadow-md">SA</div>
            <div className="hidden sm:block">
              <p className={`text-sm font-black leading-none ${dk ? "text-white" : "text-slate-900"}`}>Mission Control</p>
              <p className={`text-[10px] font-medium ${dk ? "text-slate-400" : "text-slate-400"}`}>Super Admin Dashboard</p>
            </div>
          </div>

          {/* Desktop tabs */}
          <nav className={`hidden md:flex items-center rounded-2xl p-1 gap-0.5 ${dk ? "bg-slate-700" : "bg-slate-100"}`}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${activeTab === t.id
                  ? dk ? "bg-slate-600 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                  : dk ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </nav>

          {/* Super admin badge */}
          <span className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wider
            ${dk ? "bg-violet-900/40 text-violet-300 border-violet-700" : "bg-violet-50 text-violet-600 border-violet-100"}`}>
            ◈ Super Admin
          </span>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t shadow-[0_-4px_20px_rgba(0,0,0,.08)]
        ${dk ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors relative
              ${activeTab === t.id ? "text-blue-500" : dk ? "text-slate-500" : "text-slate-400"}`}>
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{t.label}</span>
            {activeTab === t.id && <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-blue-500" />}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8">

        {/* ═══════════ OVERVIEW ═══════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black ${heading(dk)}`}>System Overview</h1>
              <p className={sub(dk) + " mt-1"}>Real-time snapshot of departments, users &amp; complaints</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Departments", value: stats.departments, icon: <Building2 />, sub: `${users.filter(u => u.role === "department_admin").length} admins`, tab: "departments" },
                { label: "Total Users", value: stats.users, icon: <Users />, sub: `${stats.workers} workers`, tab: "users" },
                { label: "Complaints", value: stats.complaints, icon: <NotepadText />, sub: `${stats.pending} pending`, tab: "complaints" },
                { label: "Resolved", value: stats.resolved, icon: <CircleCheck />, sub: `${stats.complaints ? Math.round(stats.resolved / stats.complaints * 100) : 0}% rate`, tab: "complaints" },
              ].map(s => (
                <button key={s.label} onClick={() => setActiveTab(s.tab)}
                  className={`group relative overflow-hidden rounded-2xl p-5 text-left bg-blue-500 hover:scale-[1.02] hover:shadow-lg transition-all duration-200`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-300" />
                  <span className="text-2xl block mb-3 text-white">{s.icon}</span>
                  <p className="text-3xl font-black text-white leading-none">{s.value}</p>
                  <p className="text-white/75 text-[10px] font-bold mt-1.5 uppercase tracking-widest">{s.label}</p>
                  <p className="text-white/55 text-[11px] mt-0.5">{s.sub}</p>
                </button>
              ))}
            </div>

            {/* Role breakdown */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                <div key={r} className={`${card(dk)} p-3 sm:p-4 text-center`}>
                  <p className={`text-xl sm:text-2xl font-black ${dk ? "text-white" : "text-slate-800"}`}>
                    {users.filter(u => u.role === r).length}
                  </p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 leading-tight ${dk ? "text-slate-500" : "text-slate-400"}`}>
                    {r.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Status pie */}
              <div className={`${card(dk)} p-5`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${dk ? "text-slate-500" : "text-slate-400"}`}>Status Breakdown</p>
                {analytics?.statusBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.statusBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} innerRadius={48} labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {analytics.statusBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={0} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n.replace(/_/g, " ")]} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: axisColor }}
                        formatter={v => v.replace(/_/g, " ")} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className={`h-40 flex items-center justify-center text-sm ${dk ? "text-slate-600" : "text-slate-300"}`}>No data</div>}
              </div>

              {/* Daily trend area */}
              <div className={`${card(dk)} p-5`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${dk ? "text-slate-500" : "text-slate-400"}`}>Daily Complaint Trend</p>
                {analytics?.dailyTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analytics.dailyTrend}>
                      <defs>
                        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={dk ? 0.25 : 0.12} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="_id" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} width={25} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} fill="url(#ag)"
                        dot={{ fill: "#3B82F6", r: 4, strokeWidth: 2, stroke: dk ? "#1e293b" : "#fff" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className={`h-40 flex items-center justify-center text-sm ${dk ? "text-slate-600" : "text-slate-300"}`}>No data</div>}
              </div>

              {/* Category bar */}
              <div className={`${card(dk)} p-5`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${dk ? "text-slate-500" : "text-slate-400"}`}>By Category</p>
                {analytics?.categoryBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.categoryBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="_id" type="category" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className={`h-40 flex items-center justify-center text-sm ${dk ? "text-slate-600" : "text-slate-300"}`}>No data</div>}
              </div>

              {/* Dept performance */}
              <div className={`${card(dk)} p-5`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${dk ? "text-slate-500" : "text-slate-400"}`}>Department Performance</p>
                {analytics?.departmentBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.departmentBreakdown.map(d => ({
                      name: (d._id.departmentName || "N/A").split(" ")[0],
                      completed: d.completed, inProgress: d.inProgress, pending: d.pending,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} width={25} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: axisColor }} />
                      <Bar dataKey="completed" fill="#10B981" name="Completed" stackId="a" />
                      <Bar dataKey="inProgress" fill="#8B5CF6" name="In Progress" stackId="a" />
                      <Bar dataKey="pending" fill="#F59E0B" name="Pending" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className={`h-40 flex items-center justify-center text-sm ${dk ? "text-slate-600" : "text-slate-300"}`}>No data</div>}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ DEPARTMENTS ═══════════ */}
        {activeTab === "departments" && (
          <div>
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h1 className={`text-2xl font-black ${heading(dk)}`}>Departments</h1>
                <p className={sub(dk) + " mt-0.5"}>{departments.length} departments in system</p>
              </div>
              <button onClick={() => { setShowDeptForm(true); setEditingDept(null); setDeptForm({ name: "", description: "" }); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm shadow-blue-300/30">
                + <span className="hidden sm:inline">New</span> Department
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {departments.length === 0 ? (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-4xl mb-3"><Building2 /></p>
                  <p className={`text-sm ${dk ? "text-slate-600" : "text-slate-400"}`}>No departments yet</p>
                </div>
              ) : departments.map((dept, idx) => {
                const dc = complaints.filter(c => (c.department_id?._id || c.department_id) === dept._id);
                const resolved = dc.filter(c => c.status === "completed").length;
                return (
                  <div key={dept._id} className={`${card(dk)} overflow-hidden hover:shadow-md transition-shadow`}>
                    <div className={`h-1.5 bg-gradient-to-r ${DEPT_GRAD[idx % DEPT_GRAD.length]}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${DEPT_GRAD[idx % DEPT_GRAD.length]} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
                            {dept.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${dk ? "text-white" : "text-slate-800"}`}>{dept.name}</p>
                            {dept.description && <p className={`text-xs mt-0.5 line-clamp-1 ${dk ? "text-slate-400" : "text-slate-400"}`}>{dept.description}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => { setEditingDept(dept); setDeptForm({ name: dept.name, description: dept.description || "" }); setShowDeptForm(true); }}
                            className={`p-2 rounded-lg text-sm transition ${dk ? "text-slate-400 hover:text-blue-400 hover:bg-blue-900/30" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}><Pencil /></button>
                          <button onClick={() => setDeleteConfirm({ type: "dept", id: dept._id, name: dept.name })}
                            className={`p-2 rounded-lg text-sm transition ${dk ? "text-slate-400 hover:text-red-400 hover:bg-red-900/30" : "text-slate-400 hover:text-red-500 hover:bg-red-50"}`}><Trash /></button>
                        </div>
                      </div>
                      <div className={`grid grid-cols-3 gap-2 text-center border-t pt-4 ${dk ? "border-slate-700" : "border-slate-50"}`}>
                        <div>
                          <p className={`text-lg font-black ${dk ? "text-white" : "text-slate-800"}`}>{dc.length}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${dk ? "text-slate-500" : "text-slate-400"}`}>Complaints</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-emerald-500">{resolved}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${dk ? "text-slate-500" : "text-slate-400"}`}>Resolved</p>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold truncate ${dk ? "text-slate-300" : "text-slate-700"}`}>{dept.admin?.name || "—"}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${dk ? "text-slate-500" : "text-slate-400"}`}>Admin</p>
                        </div>
                      </div>
                    </div>
                    <div className={`px-5 pb-4 text-[10px] ${dk ? "text-slate-600" : "text-slate-300"}`}>Created {fmtDate(dept.createdAt)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ USERS ═══════════ */}
        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <h1 className={`text-2xl font-black ${heading(dk)}`}>User Management</h1>
                <p className={sub(dk) + " mt-0.5"}>{users.length} users registered</p>
              </div>
              <div className="flex gap-2">
                {selectedUsers.length > 0 && (
                  <button onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition">
                    🗑 Delete ({selectedUsers.length})
                  </button>
                )}
                <button onClick={() => setShowUserForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-sm shadow-emerald-300/30">
                  + <span className="hidden sm:inline">New</span> User
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
                placeholder="Search name or email…"
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition
                  ${dk ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/40"
                    : "bg-white border-slate-200 text-slate-800 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"}`} />
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className={`sm:w-44 rounded-xl border px-4 py-2.5 text-sm outline-none transition
                  ${dk ? "bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500"
                    : "bg-white border-slate-200 text-slate-600 focus:border-blue-300"}`}>
                <option value="all">All Roles</option>
                {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                  <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="py-16 text-center"><p className={`text-sm ${dk ? "text-slate-600" : "text-slate-400"}`}>No users found</p></div>
              ) : filteredUsers.map(user => {
                const sel = selectedUsers.includes(user._id);
                return (
                  <div key={user._id} className={`${card(dk)} p-4 transition ${sel ? dk ? "border-blue-600/50" : "border-blue-200" : ""}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={sel}
                        onChange={e => e.target.checked ? setSelectedUsers([...selectedUsers, user._id]) : setSelectedUsers(selectedUsers.filter(i => i !== user._id))}
                        className="mt-1 w-4 h-4 rounded flex-shrink-0" />
                      <Avatar name={user.name} src={user.profileImage} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-bold text-sm ${dk ? "text-white" : "text-slate-800"}`}>{user.name}</p>
                            <p className={`text-xs truncate ${dk ? "text-slate-400" : "text-slate-400"}`}>{user.email}</p>
                          </div>
                          <button onClick={() => setDeleteConfirm({ type: "user", id: user._id, name: user.name })}
                            className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded-lg transition flex-shrink-0">Del</button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_CLR[user.role] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                            {user.role?.replace(/_/g, " ")}
                          </span>
                          <button onClick={() => handleToggleStatus(user._id)}
                            disabled={user._id === currentUser?._id}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition ${user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                            {user.status === "active" ? "● Active" : "○ Blocked"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className={`hidden sm:block ${card(dk)} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className={`border-b ${dk ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50/70"}`}>
                      <th className="px-5 py-4 w-10">
                        <input type="checkbox"
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onChange={e => e.target.checked ? setSelectedUsers(users.map(u => u._id)) : setSelectedUsers([])}
                          className="w-4 h-4 rounded" />
                      </th>
                      {["User", "Email", "Role", "Status", "Department", "Actions"].map(h => (
                        <th key={h} className={`px-5 py-4 text-left ${tableHead(dk)}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={7} className={`py-16 text-center text-sm ${dk ? "text-slate-600" : "text-slate-300"}`}>No users match your filters</td></tr>
                    ) : filteredUsers.map(user => {
                      const deptId = user.department && typeof user.department === "object" ? user.department._id : user.department || "";
                      return (
                        <tr key={user._id} className={tableRow(dk) + (selectedUsers.includes(user._id) ? dk ? " bg-blue-900/10" : " bg-blue-50/30" : "")}>
                          <td className="px-5 py-3.5">
                            <input type="checkbox" checked={selectedUsers.includes(user._id)}
                              onChange={e => e.target.checked ? setSelectedUsers([...selectedUsers, user._id]) : setSelectedUsers(selectedUsers.filter(i => i !== user._id))}
                              className="w-4 h-4 rounded" />
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={user.name} src={user.profileImage} size="sm" />
                              <p className={`font-semibold text-sm ${dk ? "text-slate-100" : "text-slate-800"}`}>{user.name}</p>
                            </div>
                          </td>
                          <td className={`px-5 py-3.5 text-sm ${dk ? "text-slate-400" : "text-slate-400"}`}>{user.email}</td>
                          <td className="px-5 py-3.5">
                            <select value={user.role}
                              onChange={e => handleRoleChange(user._id, e.target.value, deptId)}
                              disabled={user._id === currentUser?._id}
                              className={`text-xs rounded-lg px-2 py-1.5 border outline-none focus:ring-1 transition
                                ${dk ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-blue-500" : "bg-white border-slate-200 text-slate-700 focus:ring-blue-100"}`}>
                              {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => handleToggleStatus(user._id)}
                              disabled={user._id === currentUser?._id}
                              className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition
                                ${user.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                              {user.status === "active" ? "● Active" : "○ Blocked"}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <select value={deptId}
                              onChange={e => handleRoleChange(user._id, user.role, e.target.value)}
                              className={`text-xs rounded-lg px-2 py-1.5 border outline-none focus:ring-1 transition
                                ${dk ? "bg-slate-700 border-slate-600 text-slate-200 focus:ring-blue-500" : "bg-white border-slate-200 text-slate-700 focus:ring-blue-100"}`}>
                              <option value="">None</option>
                              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => setDeleteConfirm({ type: "user", id: user._id, name: user.name })}
                              className="text-xs text-red-400 hover:text-red-500 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ COMPLAINTS ═══════════ */}
        {activeTab === "complaints" && (
          <div>
            <div className="mb-6">
              <h1 className={`text-2xl font-black ${heading(dk)}`}>All Complaints</h1>
              <p className={sub(dk) + " mt-0.5"}>{complaints.length} total system-wide</p>
            </div>

            {/* Status filter pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              {["all", "pending", "verified", "in_progress", "completed", "rejected", "approved_by_user"].map(s => {
                const cnt = s === "all" ? complaints.length : complaints.filter(c => c.status === s).length;
                const active = filterStatus === s;
                return (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition whitespace-nowrap
                      ${active ? "bg-blue-600 text-white border-blue-600"
                        : dk ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                    {s === "all" ? `All (${cnt})` : `${s.replace(/_/g, " ")} (${cnt})`}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="mb-5">
              <input value={searchComplaints} onChange={e => setSearchComplaints(e.target.value)}
                placeholder="Search complaints…"
                className={`w-full sm:w-80 rounded-xl border px-4 py-2.5 text-sm outline-none transition
                  ${dk ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/40"
                    : "bg-white border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"}`} />
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filteredComplaints.length === 0 ? (
                <div className="py-16 text-center"><p className={`text-sm ${dk ? "text-slate-600" : "text-slate-400"}`}>No complaints found</p></div>
              ) : filteredComplaints.map(c => (
                <div key={c._id} className={`${card(dk)} p-4`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <span className={`font-mono text-[10px] ${dk ? "text-slate-600" : "text-slate-300"}`}>#{c._id?.slice(-6)}</span>
                      <p className={`text-sm font-semibold mt-0.5 line-clamp-2 ${dk ? "text-slate-200" : "text-slate-800"}`}>{c.issue}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {c.department_id?.name && (
                      <span className={`px-2 py-0.5 rounded-full font-medium ${dk ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                        {c.department_id.name}
                      </span>
                    )}
                    {c.userId?.name && <span className={dk ? "text-slate-400" : "text-slate-400"}>{c.userId.name}</span>}
                    <span className={`ml-auto ${dk ? "text-slate-500" : "text-slate-400"}`}>{fmtDate(c.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className={`hidden sm:block ${card(dk)} overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className={`border-b ${dk ? "border-slate-700 bg-slate-700/30" : "border-slate-100 bg-slate-50/70"}`}>
                      {["ID", "Issue", "Status", "Department", "Filed By", "Date"].map(h => (
                        <th key={h} className={`px-5 py-4 text-left ${tableHead(dk)}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr><td colSpan={6} className={`py-16 text-center text-sm ${dk ? "text-slate-600" : "text-slate-300"}`}>No complaints found</td></tr>
                    ) : filteredComplaints.map(c => (
                      <tr key={c._id} className={tableRow(dk) + " group"}>
                        <td className="px-5 py-4">
                          <span className={`font-mono text-xs ${dk ? "text-slate-600" : "text-slate-300"}`}>#{c._id?.slice(-6)}</span>
                        </td>
                        <td className="px-5 py-4 max-w-[220px]">
                          <p className={`text-sm font-semibold truncate group-hover:text-blue-500 transition-colors ${dk ? "text-slate-200" : "text-slate-700"}`}>{c.issue || "—"}</p>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dk ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"}`}>
                            {c.department_id?.name || "Unassigned"}
                          </span>
                        </td>
                        <td className={`px-5 py-4 text-sm ${dk ? "text-slate-400" : "text-slate-500"}`}>{c.userId?.name || "—"}</td>
                        <td className={`px-5 py-4 text-xs whitespace-nowrap ${dk ? "text-slate-500" : "text-slate-400"}`}>{fmtDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ Modals ═══ */}
      {showDeptForm && (
        <Modal title={editingDept ? "Edit Department" : "Create Department"} submitLabel={editingDept ? "Update" : "Create"} dk={dk}
          onClose={() => { setShowDeptForm(false); setEditingDept(null); setDeptForm({ name: "", description: "" }); }}
          onSubmit={handleDeptSubmit}>
          <Field label="Department Name" required dk={dk}>
            <input type="text" required className={inputCls(dk)} value={deptForm.name} placeholder="e.g. Water Supply"
              onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
          </Field>
          <Field label="Description" dk={dk}>
            <textarea rows={3} className={inputCls(dk) + " resize-none"} value={deptForm.description} placeholder="Brief description…"
              onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} />
          </Field>
        </Modal>
      )}

      {showUserForm && (
        <Modal title="Create New User" submitLabel="Create User" dk={dk}
          onClose={() => { setShowUserForm(false); setUserForm({ name: "", email: "", password: "", role: "", department_id: "" }); }}
          onSubmit={handleUserSubmit}>
          {[
            { label: "Full Name", key: "name", type: "text", ph: "Arjun Mehta", req: true },
            { label: "Email", key: "email", type: "email", ph: "arjun@gov.in", req: true },
            { label: "Password", key: "password", type: "password", ph: "••••••••", req: true },
          ].map(f => (
            <Field key={f.key} label={f.label} required={f.req} dk={dk}>
              <input type={f.type} required={f.req} className={inputCls(dk)} placeholder={f.ph}
                value={userForm[f.key]} onChange={e => setUserForm({ ...userForm, [f.key]: e.target.value })} />
            </Field>
          ))}
          <Field label="Role" required dk={dk}>
            <select required className={inputCls(dk) + " cursor-pointer"} value={userForm.role}
              onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="">Select role…</option>
              {["department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Department" dk={dk}>
            <select className={inputCls(dk) + " cursor-pointer"} value={userForm.department_id}
              onChange={e => setUserForm({ ...userForm, department_id: e.target.value })}>
              <option value="">None</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title={`Delete ${deleteConfirm.type === "user" ? "User" : "Department"}`} submitLabel="Yes, Delete" danger dk={dk}
          onClose={() => setDeleteConfirm(null)}
          onSubmit={e => { e.preventDefault(); deleteConfirm.type === "user" ? handleUserDelete() : handleDeptDelete(); }}>
          <div className={`flex items-start gap-4 p-4 rounded-xl border ${dk ? "bg-red-900/20 border-red-800/40" : "bg-red-50 border-red-100"}`}>
            <span className="text-3xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-red-500 text-sm mb-1">This cannot be undone</p>
              <p className={`text-sm ${dk ? "text-red-400" : "text-red-600"}`}>
                You're about to permanently delete <strong>"{deleteConfirm.name}"</strong>.
                {deleteConfirm.type === "dept" && " All associated data may be affected."}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SuperAdminDashboard;