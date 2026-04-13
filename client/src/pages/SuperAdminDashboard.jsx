import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/department";
import { fetchUsers, createUser, setUserRole, getToken } from "../services/auth";
import { fetchComplaints } from "../services/complaints";
import { fetchWorkerTasks } from "../services/workerTask";

/* ── helpers ── */
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
const API_AUTH = "http://localhost:5000/auth";

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
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [workerTasks, setWorkerTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: "", description: "" });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "", department_id: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'user'|'dept', id, name }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "super_admin") { nav("/"); return; }
    loadAll();
  }, [nav]);

  const loadAll = async () => {
    setLoading(true);
    const [d, u, c, w] = await Promise.all([fetchDepartments(), fetchUsers(), fetchComplaints(), fetchWorkerTasks()]);
    if (d.success) setDepartments(d.departments || []);
    if (u.success) setUsers(u.users || []);
    if (c.success) setComplaints(c.complaints || []);
    if (w.success) setWorkerTasks(w.workerTasks || []);
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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400 font-medium">Loading Mission Control…</p>
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
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow">SA</div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">Mission Control</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Super Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Tab Nav */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {t.label}
                </button>
              ))}
            </nav>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">SUPER ADMIN</span>
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
            <h1 className="text-2xl font-bold text-slate-900 mb-1">System Overview</h1>
            <p className="text-sm text-slate-400 mb-8">Real-time snapshot of all departments, users & complaints</p>

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
                  <p className="text-xs text-slate-500 font-semibold mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">Quick Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Pending Complaints", value: stats.pending, color: "bg-amber-400" },
                    { label: "Department Admins", value: stats.deptAdmins, color: "bg-blue-400" },
                    { label: "Workers", value: stats.workers, color: "bg-emerald-400" },
                    { label: "Departments Active", value: stats.departments, color: "bg-violet-400" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${r.color}`} />
                        <span className="text-sm text-slate-600">{r.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent complaints */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">Recent Complaints</h3>
                <div className="space-y-2">
                  {complaints.slice(0, 5).map(c => (
                    <div key={c._id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{c.issue || "—"}</p>
                        <p className="text-xs text-slate-400">{c.department_id?.name || "No dept"}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                  {complaints.length === 0 && <p className="text-sm text-slate-300 text-center py-4">No complaints yet</p>}
                </div>
              </div>
            </div>
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
                    const admin = users.find(u => u.role === "department_admin" && (u.department?._id || u.department) === dept._id);
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
                          {admin ? (
                            <span className="flex items-center gap-1.5 text-sm text-slate-700">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">{initials(admin.name)}</span>
                              {admin.name}
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
              <button onClick={() => setShowUserForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm">
                + Add User
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-300">No users yet</td></tr>
                  ) : users.map(user => {
                    const deptId = user.department && typeof user.department === "object" ? user.department._id : user.department || "";
                    return (
                      <tr key={user._id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
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
                            onChange={e => handleRoleChange(user._id, e.target.value, deptId)}>
                            {["user", "department_admin", "worker", "contractor", "analyzer", "super_admin"].map(r => (
                              <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                            value={deptId}
                            onChange={e => handleRoleChange(user._id, user.role, e.target.value)}>
                            <option value="">None</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => setDeleteConfirm({ type: "user", id: user._id, name: user.name })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition">
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
              onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
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