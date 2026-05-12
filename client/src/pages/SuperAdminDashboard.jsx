import { useEffect, useState, useCallback } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from "recharts";

/* ─── Mock data for preview (replace with real API calls) ─── */
const MOCK_USERS = [
  { _id: "u1", name: "Arjun Mehta", email: "arjun@gov.in", role: "department_admin", status: "active", department: { _id: "d1", name: "Water Supply" } },
  { _id: "u2", name: "Priya Sharma", email: "priya@gov.in", role: "worker", status: "active", department: { _id: "d2", name: "Roads" } },
  { _id: "u3", name: "Rahul Singh", email: "rahul@gov.in", role: "analyzer", status: "inactive", department: null },
  { _id: "u4", name: "Sneha Patel", email: "sneha@gov.in", role: "worker", status: "active", department: { _id: "d1", name: "Water Supply" } },
  { _id: "u5", name: "Vikram Joshi", email: "vikram@gov.in", role: "contractor", status: "active", department: { _id: "d3", name: "Electricity" } },
  { _id: "u6", name: "Meera Nair", email: "meera@gov.in", role: "super_admin", status: "active", department: null },
];
const MOCK_DEPTS = [
  { _id: "d1", name: "Water Supply", description: "Municipal water distribution", createdAt: "2024-01-15", admin: { name: "Arjun Mehta" } },
  { _id: "d2", name: "Roads & Highways", description: "Road maintenance & construction", createdAt: "2024-02-01", admin: null },
  { _id: "d3", name: "Electricity Board", description: "Power distribution & billing", createdAt: "2024-01-20", admin: { name: "Priya K" } },
  { _id: "d4", name: "Sanitation", description: "Waste management services", createdAt: "2024-03-10", admin: null },
];
const MOCK_COMPLAINTS = [
  { _id: "c1", issue: "Water pipe burst near Station Road", status: "in_progress", department_id: { name: "Water Supply" }, userId: { name: "Ravi Kumar" }, createdAt: "2026-05-10" },
  { _id: "c2", issue: "Pothole on MG Road causing accidents", status: "pending", department_id: { name: "Roads & Highways" }, userId: { name: "Anita Rao" }, createdAt: "2026-05-09" },
  { _id: "c3", issue: "Street light not working for 3 weeks", status: "completed", department_id: { name: "Electricity Board" }, userId: { name: "Mohan Das" }, createdAt: "2026-05-08" },
  { _id: "c4", issue: "Garbage not collected from Sector 7", status: "verified", department_id: { name: "Sanitation" }, userId: { name: "Lata Singh" }, createdAt: "2026-05-07" },
  { _id: "c5", issue: "Low water pressure in residential area", status: "approved_by_user", department_id: { name: "Water Supply" }, userId: { name: "Deepak Jain" }, createdAt: "2026-05-06" },
  { _id: "c6", issue: "Illegal dumping near park entrance", status: "rejected", department_id: { name: "Sanitation" }, userId: { name: "Sonia Verma" }, createdAt: "2026-05-05" },
];
const MOCK_ANALYTICS = {
  statusBreakdown: [
    { _id: "pending", count: 18 }, { _id: "in_progress", count: 12 },
    { _id: "completed", count: 31 }, { _id: "verified", count: 7 },
    { _id: "rejected", count: 5 }, { _id: "approved_by_user", count: 9 },
  ],
  dailyTrend: [
    { _id: "May 6", count: 4 }, { _id: "May 7", count: 7 }, { _id: "May 8", count: 3 },
    { _id: "May 9", count: 9 }, { _id: "May 10", count: 6 }, { _id: "May 11", count: 11 },
    { _id: "May 12", count: 5 },
  ],
  categoryBreakdown: [
    { _id: "Water Supply", count: 22 }, { _id: "Roads", count: 18 },
    { _id: "Electricity", count: 14 }, { _id: "Sanitation", count: 11 }, { _id: "Other", count: 8 },
  ],
  locationBreakdown: [
    { _id: { city: "Surat" }, count: 29 }, { _id: { city: "Vadodara" }, count: 18 },
    { _id: { city: "Rajkot" }, count: 12 }, { _id: { city: "Ahmedabad" }, count: 14 },
  ],
  departmentBreakdown: [
    { _id: { departmentName: "Water Supply" }, total: 22, pending: 8, inProgress: 7, completed: 7 },
    { _id: { departmentName: "Roads" }, total: 18, pending: 6, inProgress: 5, completed: 7 },
    { _id: { departmentName: "Electricity" }, total: 14, pending: 3, inProgress: 3, completed: 8 },
    { _id: { departmentName: "Sanitation" }, total: 11, pending: 4, inProgress: 2, completed: 5 },
  ],
};

/* ─── Constants ─── */
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const STATUS_CONFIG = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", border: "border-amber-200", label: "Pending" },
  verified: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200", label: "Verified" },
  in_progress: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200", label: "In Progress" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200", label: "Completed" },
  rejected: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", border: "border-red-200", label: "Rejected" },
  user_approval_pending: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400", border: "border-orange-200", label: "Awaiting Approval" },
  approved_by_user: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500", border: "border-teal-200", label: "Approved" },
  rejected_by_user: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400", border: "border-rose-200", label: "Rejected by User" },
};

const ROLE_STYLES = {
  super_admin: "bg-violet-100 text-violet-700 border border-violet-200",
  department_admin: "bg-blue-100 text-blue-700 border border-blue-200",
  worker: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  analyzer: "bg-amber-100 text-amber-700 border border-amber-200",
  contractor: "bg-orange-100 text-orange-700 border border-orange-200",
  user: "bg-slate-100 text-slate-600 border border-slate-200",
};

const DEPT_COLORS = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600"];

/* ─── Helpers ─── */
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/* ─── Sub-components ─── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-400", border: "border-slate-200", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label || status?.replace(/_/g, " ")}
    </span>
  );
};

const Avatar = ({ name, src, size = "md" }) => {
  const sizeMap = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };
  if (src) return <img src={src} alt="" className={`${sizeMap[size]} rounded-full object-cover flex-shrink-0 ring-2 ring-white`} />;
  return (
    <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-white`}>
      {initials(name)}
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, gradient, onClick }) => (
  <button onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br ${gradient} cursor-pointer`}>
    <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full bg-white transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
    <span className="text-2xl mb-3 block">{icon}</span>
    <p className="text-3xl font-black text-white leading-none">{value}</p>
    <p className="text-white/80 text-xs font-semibold mt-1.5 uppercase tracking-widest">{label}</p>
    {sub && <p className="text-white/60 text-[11px] mt-1">{sub}</p>}
  </button>
);

const SectionHeader = ({ title, count, action }) => (
  <div className="flex items-center justify-between mb-6 gap-4">
    <div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {count !== undefined && <p className="text-sm text-slate-400 mt-0.5">{count} total</p>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon, msg }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-3">{icon}</span>
    <p className="text-slate-400 text-sm font-medium">{msg}</p>
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>
    <div className="px-5 pt-5 pb-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
    </div>
    <div className="px-5 pb-5">{children}</div>
  </div>
);

/* ─── Modal ─── */
const Modal = ({ title, onClose, onSubmit, submitLabel, danger, children }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        <button onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl transition">×</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">{children}</div>
        <div className="flex justify-end gap-2 px-6 pb-6 pt-1 border-t border-slate-50">
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
          <button type="submit"
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-sm ${danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-slate-300";

/* ─── TABS ─── */
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "departments", label: "Departments", icon: "🏢" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "complaints", label: "Complaints", icon: "📋" },
];

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [departments, setDepartments] = useState(MOCK_DEPTS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [analytics, setAnalytics] = useState(MOCK_ANALYTICS);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [searchComplaints, setSearchComplaints] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "", department_id: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const stats = {
    departments: departments.length,
    users: users.length,
    complaints: complaints.length,
    resolved: complaints.filter(c => ["completed", "approved_by_user"].includes(c.status)).length,
    pending: complaints.filter(c => c.status === "pending").length,
    workers: users.filter(u => u.role === "worker").length,
  };

  /* ── filtered lists ── */
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUsers.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.issue || "").toLowerCase().includes(searchComplaints.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ── handlers ── */
  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (editingDept) {
      setDepartments(departments.map(d => d._id === editingDept._id ? { ...d, ...deptForm } : d));
      showToast("Department updated successfully");
    } else {
      setDepartments([...departments, { _id: Date.now().toString(), ...deptForm, createdAt: new Date().toISOString(), admin: null }]);
      showToast("Department created");
    }
    setShowDeptForm(false); setEditingDept(null); setDeptForm({ name: "", description: "" });
  };

  const handleDeptDelete = () => {
    setDepartments(departments.filter(d => d._id !== deleteConfirm.id));
    setDeleteConfirm(null); showToast("Department deleted");
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setUsers([...users, { _id: Date.now().toString(), ...userForm, status: "active", department: null }]);
    setShowUserForm(false); setUserForm({ name: "", email: "", password: "", role: "", department_id: "" });
    showToast("User created successfully");
  };

  const handleUserDelete = () => {
    setUsers(users.filter(u => u._id !== deleteConfirm.id));
    setDeleteConfirm(null); showToast("User deleted");
  };

  const handleToggleStatus = (userId, currentStatus) => {
    setUsers(users.map(u => u._id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
    showToast(currentStatus === "active" ? "User blocked" : "User unblocked");
  };

  const handleRoleChange = (userId, role) => {
    setUsers(users.map(u => u._id === userId ? { ...u, role } : u));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading Mission Control…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-20 md:pb-0 font-sans">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold text-white shadow-xl transition-all
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          <span>{toast.type === "error" ? "⚠" : "✓"}</span>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-1">×</button>
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-200">SA</div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">Mission Control</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Super Admin</p>
            </div>
          </div>

          {/* Desktop tab nav */}
          <nav className="hidden md:flex items-center bg-slate-100 rounded-2xl p-1 gap-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${activeTab === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"}`}>
                {t.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 uppercase tracking-wider">
              ◈ Super Admin
            </span>
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${activeTab === t.id ? "text-blue-600" : "text-slate-400"}`}>
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{t.label}</span>
            {activeTab === t.id && <span className="absolute bottom-0 w-1 h-1 rounded-full bg-blue-600" />}
          </button>
        ))}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8">

        {/* ═══════════════════ OVERVIEW ═══════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">System Overview</h1>
              <p className="text-sm text-slate-400 mt-1">Real-time snapshot of your complaint management platform</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Departments" value={stats.departments} icon="🏢" gradient="from-blue-500 to-indigo-600" sub="Active units"
                onClick={() => setActiveTab("departments")} />
              <StatCard label="Total Users" value={stats.users} icon="👥" gradient="from-violet-500 to-purple-600" sub={`${stats.workers} workers`}
                onClick={() => setActiveTab("users")} />
              <StatCard label="Complaints" value={stats.complaints} icon="📋" gradient="from-amber-400 to-orange-500" sub={`${stats.pending} pending`}
                onClick={() => setActiveTab("complaints")} />
              <StatCard label="Resolved" value={stats.resolved} icon="✅" gradient="from-emerald-400 to-teal-600" sub={`${Math.round((stats.resolved / stats.complaints) * 100) || 0}% rate`}
                onClick={() => setActiveTab("complaints")} />
            </div>

            {/* Quick role breakdown */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(role => {
                const count = users.filter(u => u.role === role).length;
                return (
                  <div key={role} className="bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 text-center">
                    <p className="text-xl sm:text-2xl font-black text-slate-800">{count}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 leading-tight">
                      {role.replace(/_/g, " ")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <ChartCard title="Status Breakdown">
                {analytics?.statusBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.statusBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} innerRadius={45}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {analytics.statusBreakdown.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n.replace(/_/g, " ")]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}
                        formatter={v => v.replace(/_/g, " ")} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyState icon="📊" msg="No data yet" />}
              </ChartCard>

              <ChartCard title="Daily Complaint Trend">
                {analytics?.dailyTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analytics.dailyTrend}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={25} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                      <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: "#3B82F6", r: 4, strokeWidth: 2, stroke: "#fff" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyState icon="📈" msg="No trend data" />}
              </ChartCard>

              <ChartCard title="Complaints by Category">
                {analytics?.categoryBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.categoryBreakdown} layout="vertical" margin={{ left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="_id" type="category" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                      <Bar dataKey="count" fill="#10B981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState icon="📊" msg="No data" />}
              </ChartCard>

              <ChartCard title="Department Performance">
                {analytics?.departmentBreakdown?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.departmentBreakdown.map(d => ({
                      name: d._id.departmentName?.split(" ")[0] || "N/A",
                      completed: d.completed, inProgress: d.inProgress, pending: d.pending
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={25} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="completed" fill="#10B981" name="Completed" stackId="a" />
                      <Bar dataKey="inProgress" fill="#8B5CF6" name="In Progress" stackId="a" />
                      <Bar dataKey="pending" fill="#F59E0B" name="Pending" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState icon="🏢" msg="No data" />}
              </ChartCard>
            </div>
          </div>
        )}

        {/* ═══════════════════ DEPARTMENTS ═══════════════════ */}
        {activeTab === "departments" && (
          <div>
            <SectionHeader title="Departments" count={departments.length}
              action={
                <button onClick={() => { setShowDeptForm(true); setEditingDept(null); setDeptForm({ name: "", description: "" }); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm shadow-blue-200">
                  <span className="text-base leading-none">+</span>
                  <span className="hidden sm:inline">New Department</span>
                  <span className="sm:hidden">Add</span>
                </button>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {departments.length === 0 ? (
                <div className="col-span-3"><EmptyState icon="🏢" msg="No departments yet" /></div>
              ) : departments.map((dept, idx) => {
                const deptComplaints = complaints.filter(c => (c.department_id?._id || c.department_id) === dept._id);
                const resolved = deptComplaints.filter(c => c.status === "completed").length;
                return (
                  <div key={dept._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Top color band */}
                    <div className={`h-1.5 bg-gradient-to-r ${DEPT_COLORS[idx % DEPT_COLORS.length]}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${DEPT_COLORS[idx % DEPT_COLORS.length]} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
                            {dept.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{dept.name}</p>
                            {dept.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{dept.description}</p>}
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => { setEditingDept(dept); setDeptForm({ name: dept.name, description: dept.description || "" }); setShowDeptForm(true); }}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition text-xs font-bold">✏️</button>
                          <button onClick={() => setDeleteConfirm({ type: "dept", id: dept._id, name: dept.name })}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition text-xs">🗑</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-50 pt-4">
                        <div>
                          <p className="text-lg font-black text-slate-800">{deptComplaints.length}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Complaints</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-emerald-600">{resolved}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-700 truncate">{dept.admin?.name || "—"}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Admin</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pb-4">
                      <p className="text-[10px] text-slate-300">Created {fmtDate(dept.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════ USERS ═══════════════════ */}
        {activeTab === "users" && (
          <div>
            <SectionHeader title="User Management" count={users.length}
              action={
                <div className="flex gap-2">
                  {selectedUsers.length > 0 && (
                    <button onClick={() => { /* bulk delete */ setSelectedUsers([]); showToast("Users deleted"); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition">
                      🗑 Delete ({selectedUsers.length})
                    </button>
                  )}
                  <button onClick={() => setShowUserForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition shadow-sm shadow-emerald-200">
                    <span>+</span>
                    <span className="hidden sm:inline">New User</span>
                  </button>
                </div>
              }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
                placeholder="Search name or email…"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition" />
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="sm:w-44 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-300 text-slate-600">
                <option value="all">All Roles</option>
                {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                  <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {filteredUsers.length === 0 ? <EmptyState icon="👤" msg="No users match your search" /> : filteredUsers.map(user => (
                <div key={user._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selectedUsers.includes(user._id)}
                      onChange={e => e.target.checked ? setSelectedUsers([...selectedUsers, user._id]) : setSelectedUsers(selectedUsers.filter(i => i !== user._id))}
                      className="mt-1 w-4 h-4 rounded flex-shrink-0" />
                    <Avatar name={user.name} src={user.profileImage} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                        <button onClick={() => setDeleteConfirm({ type: "user", id: user._id, name: user.name })}
                          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition flex-shrink-0">Del</button>
                      </div>
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLES[user.role] || "bg-slate-100 text-slate-500"}`}>
                          {user.role?.replace(/_/g, " ")}
                        </span>
                        <button onClick={() => handleToggleStatus(user._id, user.status)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition ${user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {user.status === "active" ? "● Active" : "○ Blocked"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-4 w-10">
                      <input type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={e => e.target.checked ? setSelectedUsers(users.map(u => u._id)) : setSelectedUsers([])}
                        className="w-4 h-4 rounded" />
                    </th>
                    {["User", "Email", "Role", "Status", "Department", "Actions"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={7} className="py-16 text-center text-sm text-slate-300">No users match your filters</td></tr>
                  ) : filteredUsers.map(user => {
                    const deptId = user.department && typeof user.department === "object" ? user.department._id : user.department || "";
                    return (
                      <tr key={user._id} className={`border-t border-slate-50 hover:bg-slate-50/40 transition-colors ${selectedUsers.includes(user._id) ? "bg-blue-50/30" : ""}`}>
                        <td className="px-5 py-3.5">
                          <input type="checkbox" checked={selectedUsers.includes(user._id)}
                            onChange={e => e.target.checked ? setSelectedUsers([...selectedUsers, user._id]) : setSelectedUsers(selectedUsers.filter(i => i !== user._id))}
                            className="w-4 h-4 rounded" />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} src={user.profileImage} size="sm" />
                            <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-400">{user.email}</td>
                        <td className="px-5 py-3.5">
                          <select value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-200">
                            {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                              <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleToggleStatus(user._id, user.status)}
                            className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition ${user.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                            {user.status === "active" ? "● Active" : "○ Blocked"}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-slate-500">
                            {user.department?.name || <span className="text-slate-300 italic">None</span>}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => setDeleteConfirm({ type: "user", id: user._id, name: user.name })}
                            className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════ COMPLAINTS ═══════════════════ */}
        {activeTab === "complaints" && (
          <div>
            <SectionHeader title="All Complaints" count={complaints.length} />

            {/* Status pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              {["all", "pending", "verified", "in_progress", "completed", "rejected"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition whitespace-nowrap
                    ${filterStatus === s ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {s === "all" ? `All (${complaints.length})` : `${s.replace(/_/g, " ")} (${complaints.filter(c => c.status === s).length})`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="mb-5">
              <input value={searchComplaints} onChange={e => setSearchComplaints(e.target.value)}
                placeholder="Search complaints…"
                className="w-full sm:w-80 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition" />
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filteredComplaints.length === 0 ? <EmptyState icon="📋" msg="No complaints found" /> : filteredComplaints.map(c => (
                <div key={c._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-slate-300">#{c._id?.slice(-6)}</span>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-2">{c.issue}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2 text-xs text-slate-400">
                    {c.department_id?.name && <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium">{c.department_id.name}</span>}
                    {c.userId?.name && <span>{c.userId.name}</span>}
                    <span className="ml-auto">{fmtDate(c.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["ID", "Issue", "Status", "Department", "Filed By", "Date"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.length === 0 ? (
                    <tr><td colSpan={6} className="py-16 text-center text-sm text-slate-300">No complaints found</td></tr>
                  ) : filteredComplaints.map(c => (
                    <tr key={c._id} className="border-t border-slate-50 hover:bg-slate-50/40 transition-colors group">
                      <td className="px-5 py-4"><span className="font-mono text-xs text-slate-300">#{c._id?.slice(-6)}</span></td>
                      <td className="px-5 py-4 max-w-[220px]">
                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{c.issue || "—"}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {c.department_id?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{c.userId?.name || "—"}</td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ═══ Modals ═══ */}
      {showDeptForm && (
        <Modal title={editingDept ? "Edit Department" : "Create Department"}
          submitLabel={editingDept ? "Update" : "Create Department"}
          onClose={() => { setShowDeptForm(false); setEditingDept(null); setDeptForm({ name: "", description: "" }); }}
          onSubmit={handleDeptSubmit}>
          <Field label="Department Name" required>
            <input type="text" required className={inputCls} value={deptForm.name} placeholder="e.g. Water Supply Division"
              onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
          </Field>
          <Field label="Description">
            <textarea rows={3} className={inputCls + " resize-none"} value={deptForm.description} placeholder="Brief description of this department…"
              onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} />
          </Field>
        </Modal>
      )}

      {showUserForm && (
        <Modal title="Create New User" submitLabel="Create User"
          onClose={() => { setShowUserForm(false); setUserForm({ name: "", email: "", password: "", role: "", department_id: "" }); }}
          onSubmit={handleUserSubmit}>
          <Field label="Full Name" required>
            <input type="text" required className={inputCls} value={userForm.name}
              onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="Arjun Mehta" />
          </Field>
          <Field label="Email" required>
            <input type="email" required className={inputCls} value={userForm.email}
              onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="arjun@gov.in" />
          </Field>
          <Field label="Password" required>
            <input type="password" required className={inputCls} value={userForm.password}
              onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" />
          </Field>
          <Field label="Role" required>
            <select required className={inputCls + " cursor-pointer"} value={userForm.role}
              onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="">Select a role…</option>
              {["department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <select className={inputCls + " cursor-pointer"} value={userForm.department_id}
              onChange={e => setUserForm({ ...userForm, department_id: e.target.value })}>
              <option value="">None</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title={`Delete ${deleteConfirm.type === "user" ? "User" : "Department"}`}
          submitLabel="Yes, Delete" danger
          onClose={() => setDeleteConfirm(null)}
          onSubmit={e => { e.preventDefault(); deleteConfirm.type === "user" ? handleUserDelete() : handleDeptDelete(); }}>
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
            <span className="text-3xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-red-700 text-sm mb-1">This cannot be undone</p>
              <p className="text-sm text-red-600">
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