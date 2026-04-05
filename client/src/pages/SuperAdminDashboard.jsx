import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from "../services/department";
import { fetchUsers, createUser, setUserRole } from "../services/auth";
import { fetchComplaints } from "../services/complaints";
import { fetchWorkerTasks } from "../services/workerTask";

/* ── tiny helpers ────────────────────────────────────────────────────── */
const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const STATUS_STYLES = {
  pending:     "bg-amber-50 text-amber-700 ring-amber-200",
  verified:    "bg-blue-50 text-blue-700 ring-blue-200",
  in_progress: "bg-violet-50 text-violet-700 ring-violet-200",
  completed:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
const STATUS_DOT = {
  pending: "bg-amber-400", verified: "bg-blue-400",
  in_progress: "bg-violet-500", completed: "bg-emerald-400",
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || "bg-slate-400"}`} />
    {status?.replace("_", " ") || "Unknown"}
  </span>
);

const StatCard = ({ label, value, icon, colorClass, bgClass, borderClass }) => (
  <div className={`relative overflow-hidden rounded-2xl border ${borderClass} ${bgClass} p-5`}>
    <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-2xl ${colorClass}`} />
    <p className="text-2xl mb-1">{icon}</p>
    <p className={`text-3xl font-bold ${colorClass} leading-none mb-1`}>{value}</p>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

/* ── Field helpers ───────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);
const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";
const selectCls = inputCls + " cursor-pointer";

/* ── Modal wrapper ───────────────────────────────────────────────────── */
const Modal = ({ title, onClose, onSubmit, submitLabel, submitColor = "bg-blue-600 hover:bg-blue-700", children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2 px-6 pb-5">
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
            Cancel
          </button>
          <button type="submit"
            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white ${submitColor} transition`}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Section = ({ dot, title, action, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      {action}
    </div>
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const Th = ({ children }) => (
  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-5 py-3.5 text-sm text-slate-700 border-t border-slate-50 ${className}`}>{children}</td>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
const SuperAdminDashboard = () => {
  const nav = useNavigate();
  const [departments, setDepartments]       = useState([]);
  const [users, setUsers]                   = useState([]);
  const [complaints, setComplaints]         = useState([]);
  const [workerTasks, setWorkerTasks]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDept] = useState(null);
  const [formData, setFormData]             = useState({ name: "", description: "" });
  const [showUserForm, setShowUserForm]     = useState(false);
  const [userFormData, setUserFormData]     = useState({ name: "", email: "", password: "", role: "", department_id: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "super_admin") { nav("/"); return; }
    loadDepartments(); loadUsers(); loadComplaints(); loadWorkerTasks();
  }, [nav]);

  const loadComplaints  = async () => { const r = await fetchComplaints();  if (r.success) setComplaints(r.complaints || []); else setError(r.message); };
  const loadWorkerTasks = async () => { const r = await fetchWorkerTasks(); if (r.success) setWorkerTasks(r.workerTasks || []); };
  const loadDepartments = async () => { setLoading(true); const r = await fetchDepartments(); if (r.success) setDepartments(r.departments); else setError(r.message); setLoading(false); };
  const loadUsers       = async () => { const r = await fetchUsers(); if (r.success) setUsers(r.users); else setError(r.message); };

  const handleCreate = async (e) => {
    e.preventDefault();
    const r = await createDepartment(formData);
    if (r.success) { setDepartments([...departments, r.department]); setShowCreateForm(false); setFormData({ name: "", description: "" }); }
    else setError(r.message);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    const r = await updateDepartment(editingDepartment._id, formData);
    if (r.success) { setDepartments(departments.map(d => d._id === editingDepartment._id ? r.department : d)); setEditingDept(null); setFormData({ name: "", description: "" }); }
    else setError(r.message);
  };
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (userFormData.role === "department_admin" && !userFormData.department_id) { setError("Department is required for department admin"); return; }
    const r = await createUser(userFormData);
    if (r.success) { setUsers([...users, r.user]); setShowUserForm(false); setUserFormData({ name:"",email:"",password:"",role:"",department_id:"" }); }
    else setError(r.message);
  };
  const handleUserUpdate = async (userId, role, department_id) => {
    const r = await setUserRole(userId, role, department_id);
    if (r.success) setUsers(users.map(u => u._id === userId ? r.user : u));
    else setError(r.message);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    const r = await deleteDepartment(id);
    if (r.success) setDepartments(departments.filter(d => d._id !== id));
    else setError(r.message);
  };
  const startEdit = (dept) => { setEditingDept(dept); setFormData({ name: dept.name, description: dept.description || "" }); };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400 font-medium">Loading dashboard…</p>
      </div>
    </div>
  );

  const resolved = complaints.filter(c => c.status === "completed").length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">SA</div>
            <span className="text-sm font-semibold text-slate-700 tracking-tight">Command Center</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 uppercase tracking-wider">Super Admin</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Mission Control</h1>
          <p className="text-sm text-slate-400">System-wide overview — departments, users, complaints &amp; tasks</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-5 py-3.5 mb-6">
            <span>⚠ {error}</span>
            <button onClick={() => setError("")} className="text-red-300 hover:text-red-500 text-lg leading-none ml-4">&times;</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Departments" value={departments.length} icon="🏢" colorClass="text-blue-500"    bgClass="bg-blue-50"    borderClass="border-blue-100" />
          <StatCard label="Total Users" value={users.length}       icon="👥" colorClass="text-cyan-500"    bgClass="bg-cyan-50"    borderClass="border-cyan-100" />
          <StatCard label="Complaints"  value={complaints.length}  icon="📋" colorClass="text-amber-500"   bgClass="bg-amber-50"   borderClass="border-amber-100" />
          <StatCard label="Resolved"    value={resolved}           icon="✅" colorClass="text-emerald-500" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
        </div>

        {/* ── Departments ─────────────────────────────────────── */}
        <Section
          dot="bg-blue-400"
          title="Departments"
          action={
            <button onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm">
              + Add Department
            </button>
          }
        >
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr><Th>Name</Th><Th>Description</Th><Th>Created</Th><Th>Actions</Th></tr>
            </thead>
            <tbody>
              {departments.length === 0
                ? <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-300">No departments yet</td></tr>
                : departments.map(dept => (
                  <tr key={dept._id} className="hover:bg-slate-50 transition-colors">
                    <Td><span className="font-semibold text-slate-800">{dept.name}</span></Td>
                    <Td className="text-slate-400 max-w-xs truncate">{dept.description || "—"}</Td>
                    <Td className="text-slate-400 whitespace-nowrap">{new Date(dept.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <button onClick={() => startEdit(dept)} className="text-blue-500 hover:text-blue-700 text-xs font-semibold mr-3 transition">Edit</button>
                      <button onClick={() => handleDelete(dept._id)} className="text-red-400 hover:text-red-600 text-xs font-semibold transition">Delete</button>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Section>

        {/* ── Users ──────────────────────────────────────────────── */}
        <Section
          dot="bg-cyan-400"
          title="User Management"
          action={
            <button onClick={() => setShowUserForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition shadow-sm">
              + Add User
            </button>
          }
        >
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr><Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Department</Th><Th /></tr>
            </thead>
            <tbody>
              {users.length === 0
                ? <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-300">No users yet</td></tr>
                : users.map((user, idx) => {
                  const deptId = user.department && typeof user.department === "object" ? user.department._id : user.department || "";
                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                            {initials(user.name)}
                          </div>
                          <span className="font-medium text-slate-800">{user.name}</span>
                        </div>
                      </Td>
                      <Td className="text-slate-400">{user.email}</Td>
                      <Td>
                        <select
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                          value={user.role}
                          onChange={(e) => handleUserUpdate(user._id, e.target.value, deptId)}>
                          {["user","department_admin","worker","contractor","analyzer","super_admin"].map(r => (
                            <option key={r} value={r}>{r.replace("_", " ")}</option>
                          ))}
                        </select>
                      </Td>
                      <Td>
                        <select
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 cursor-pointer"
                          value={deptId}
                          onChange={(e) => {
                            if (user.role === "department_admin" && !e.target.value) { setError("Department admin must have a department"); return; }
                            handleUserUpdate(user._id, user.role, e.target.value);
                          }}>
                          <option value="">None</option>
                          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                      </Td>
                      <Td />
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Section>

        {/* ── Complaints ─────────────────────────────────────────── */}
        <Section
          dot="bg-amber-400"
          title="Complaints & Assigned Workers"
          action={<span className="text-xs text-slate-400 font-medium">{complaints.length} total</span>}
        >
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr><Th>ID</Th><Th>Issue</Th><Th>Status</Th><Th>Department</Th><Th>Worker</Th><Th>Date</Th></tr>
            </thead>
            <tbody>
              {complaints.length === 0
                ? <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-300">No complaints found</td></tr>
                : complaints.map(complaint => {
                  const task   = workerTasks.find(t => t.complaint_id === complaint._id);
                  const worker = task?.worker_id?.name || task?.worker?.name || "—";
                  return (
                    <tr key={complaint._id} className="hover:bg-slate-50 transition-colors">
                      <Td><span className="font-mono text-xs text-slate-400">#{complaint._id?.slice(-6)}</span></Td>
                      <Td><span className="block max-w-[200px] truncate">{complaint.issue || "—"}</span></Td>
                      <Td><StatusPill status={complaint.status} /></Td>
                      <Td className="text-slate-400">{complaint.department_id?.name || "—"}</Td>
                      <Td className={worker === "—" ? "text-slate-300" : "text-slate-700 font-medium"}>{worker}</Td>
                      <Td className="text-slate-400 text-xs whitespace-nowrap">{new Date(complaint.createdAt).toLocaleDateString()}</Td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Section>
      </main>

      {/* ── Create User Modal ──────────────────────────────────── */}
      {showUserForm && (
        <Modal title="Create New User" submitLabel="Create User"
          submitColor="bg-emerald-500 hover:bg-emerald-600"
          onClose={() => { setShowUserForm(false); setUserFormData({ name:"",email:"",password:"",role:"",department_id:"" }); }}
          onSubmit={handleCreateUser}>
          <Field label="Name">
            <input type="text" required className={inputCls} value={userFormData.name}
              onChange={e => setUserFormData({...userFormData, name: e.target.value})} />
          </Field>
          <Field label="Email">
            <input type="email" required className={inputCls} value={userFormData.email}
              onChange={e => setUserFormData({...userFormData, email: e.target.value})} />
          </Field>
          <Field label="Password">
            <input type="password" required className={inputCls} value={userFormData.password}
              onChange={e => setUserFormData({...userFormData, password: e.target.value})} />
          </Field>
          <Field label="Role">
            <select required className={selectCls} value={userFormData.role}
              onChange={e => setUserFormData({...userFormData, role: e.target.value})}>
              <option value="">Select role</option>
              {["department_admin","worker","contractor","analyzer","super_admin"].map(r =>
                <option key={r} value={r}>{r.replace("_"," ")}</option>)}
            </select>
          </Field>
          <Field label="Department">
            <select className={selectCls} value={userFormData.department_id}
              onChange={e => setUserFormData({...userFormData, department_id: e.target.value})}>
              <option value="">None</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </Field>
        </Modal>
      )}

      {/* ── Dept Modal ────────────────────────────────────────── */}
      {(showCreateForm || editingDepartment) && (
        <Modal
          title={editingDepartment ? "Edit Department" : "Create Department"}
          submitLabel={editingDepartment ? "Update" : "Create"}
          onClose={() => { setShowCreateForm(false); setEditingDept(null); setFormData({ name:"",description:"" }); }}
          onSubmit={editingDepartment ? handleUpdate : handleCreate}>
          <Field label="Name">
            <input type="text" required className={inputCls} value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </Field>
          <Field label="Description">
            <textarea rows={3} className={inputCls + " resize-none"} value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})} />
          </Field>
        </Modal>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
