import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaints, updateComplaintStatusRequest } from "../services/complaints";
import { fetchPermissions } from "../services/permissions";
import { fetchUsers, getTokenPayload } from "../services/auth";
import { fetchDepartments } from "../services/department";
import { createWorkerTask, autoAssignWorker } from "../services/workerTask";
import ComplaintDetail from "./ComplaintDetail";

const STATUS_CONFIG = {
  pending:               { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-200",   label: "Pending" },
  verified:              { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    border: "border-blue-200",    label: "Verified" },
  in_progress:           { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500",  border: "border-violet-200",  label: "In Progress" },
  completed:             { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200", label: "Completed" },
  rejected:              { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400",     border: "border-red-200",     label: "Rejected" },
  user_approval_pending: { bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-400",  border: "border-orange-200",  label: "Approval Pending" },
  approved_by_user:      { bg: "bg-teal-50",    text: "text-teal-700",    dot: "bg-teal-500",    border: "border-teal-200",    label: "Approved" },
  assigned:              { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400",  border: "border-indigo-200",  label: "Assigned" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300", border: "border-slate-200", label: status || "unknown" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const DepartmentAdminDashboard = () => {
  const nav = useNavigate();

  const [complaints, setComplaints]   = useState([]);
  const [workers, setWorkers]         = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  const [myDeptId, setMyDeptId]     = useState(null);
  const [myDeptName, setMyDeptName] = useState("");

  const [activeTab,           setActiveTab]           = useState("complaints");
  const [statusFilter,        setStatusFilter]        = useState("all");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [viewComplaintId,     setViewComplaintId]     = useState(null);
  const [selectedWorkerId,    setSelectedWorkerId]    = useState("");
  const [assignMsg,           setAssignMsg]           = useState("");
  const [assigning,           setAssigning]           = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "department_admin") { nav("/"); return; }
    loadAll();
  }, [nav]);

  const filterByMyDept = (all, deptId) => {
    if (!deptId) return [];
    return all.filter(c => {
      const cd = c.department_id;
      if (!cd) return false;
      return String(typeof cd === "object" ? (cd._id || cd) : cd) === String(deptId);
    });
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      // ✅ STEP 1: JWT token decode — department ObjectId get karo
      // Login time JWT ma department field hoy che (authController login function)
      const payload = getTokenPayload();
      let deptId = payload?.department ? String(payload.department) : null;
      let deptName = "";

      // ✅ STEP 2: Departments list fetch — name resolve karo
      const [deptsRes, compRes, permRes, usersRes] = await Promise.all([
        fetchDepartments(),
        fetchComplaints(),
        fetchPermissions(),
        fetchUsers(),
      ]);

      if (deptsRes.success && deptId) {
        const found = (deptsRes.departments || []).find(d => String(d._id) === String(deptId));
        if (found) deptName = found.name;
      }

      // ✅ FALLBACK: If JWT had no department, try from complaint's department_id
      // (Backend already filters complaints for dept_admin, so first complaint = my dept)
      if (!deptId && compRes.success) {
        const first = (compRes.complaints || []).find(c => c.department_id);
        if (first) {
          const cd = first.department_id;
          deptId = String(typeof cd === "object" ? (cd._id || cd) : cd);
          if (!deptName && typeof cd === "object" && cd.name) deptName = cd.name;
        }
      }

      // ✅ FALLBACK 2: If deptId found but name still missing, check departments list again
      if (deptId && !deptName && deptsRes.success) {
        const found = (deptsRes.departments || []).find(d => String(d._id) === String(deptId));
        if (found) deptName = found.name;
      }

      setMyDeptId(deptId);
      setMyDeptName(deptName);

      if (compRes.success) {
        setComplaints(filterByMyDept(compRes.complaints || [], deptId));
      }
      if (permRes.success)  setPermissions(permRes.permissions || []);
      if (usersRes.success) setWorkers((usersRes.users || []).filter(u => u.role === "worker"));

    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const refreshComplaints = async () => {
    const res = await fetchComplaints();
    if (res.success) setComplaints(filterByMyDept(res.complaints || [], myDeptId));
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  const handleVerifyAutoAssign = async (complaintId) => {
    setAssigning(true); setAssignMsg("Processing…");
    const vRes = await updateComplaintStatusRequest(complaintId, "verified");
    if (!vRes.success) { setAssignMsg(vRes.message || "Verify failed"); setAssigning(false); return; }
    const aRes = await autoAssignWorker(complaintId);
    setAssignMsg(aRes.success
      ? `✅ Verified & assigned to ${aRes.assignedWorker?.name || "a worker"}`
      : `Verified but: ${aRes.message || "auto-assign failed"}`);
    if (aRes.success) showSuccess("Verified & worker assigned!");
    await refreshComplaints();
    setAssigning(false);
  };

  const handleManualAssign = async () => {
    if (!selectedComplaintId) { setAssignMsg("Select a complaint first"); return; }
    if (!selectedWorkerId)    { setAssignMsg("Select a worker first"); return; }
    setAssigning(true);
    const res = await createWorkerTask({ complaint_id: selectedComplaintId, worker_id: selectedWorkerId, status: "assigned" });
    if (res.success) { setAssignMsg("✅ Worker assigned!"); showSuccess("Worker assigned!"); await refreshComplaints(); }
    else setAssignMsg(res.message || "Assignment failed");
    setAssigning(false);
  };

  const handleAutoAssign = async () => {
    if (!selectedComplaintId) { setAssignMsg("Select a complaint first"); return; }
    setAssigning(true);
    const res = await autoAssignWorker(selectedComplaintId);
    if (res.success) { setAssignMsg(`✅ Auto-assigned to ${res.assignedWorker?.name || "a worker"}`); showSuccess("Auto-assigned!"); await refreshComplaints(); }
    else setAssignMsg(res.message || "Auto-assign failed");
    setAssigning(false);
  };

  const stats = {
    total:          complaints.length,
    pending:        complaints.filter(c => c.status === "pending").length,
    verified:       complaints.filter(c => c.status === "verified").length,
    inProgress:     complaints.filter(c => c.status === "in_progress").length,
    resolved:       complaints.filter(c => ["completed","approved_by_user"].includes(c.status)).length,
    approvalPending:complaints.filter(c => c.status === "user_approval_pending").length,
  };

  const visibleComplaints = statusFilter === "all"
    ? complaints
    : complaints.filter(c => c.status === statusFilter);

  const selectedComplaint = complaints.find(c => c._id === selectedComplaintId);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] pt-16 pb-12">

      {/* Toasts */}
      {(error || success) && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {error   && <div className="flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg"><span className="flex-1">⚠ {error}</span><button onClick={() => setError("")} className="opacity-70 hover:opacity-100 text-lg">&times;</button></div>}
          {success && <div className="bg-emerald-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">✓ {success}</div>}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl text-white p-8 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 opacity-[0.06] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, #60a5fa, transparent)", transform: "translate(25%,-25%)" }} />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 mb-2">Department Admin</p>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {myDeptName ? `${myDeptName} Department` : "Department Dashboard"}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {myDeptName
                    ? `Showing only ${myDeptName} department complaints`
                    : myDeptId ? "Loading department name…" : "No department assigned — ask Super Admin"}
                </p>
              </div>
              {myDeptName && (
                <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-blue-200 text-sm font-semibold">{myDeptName}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label: "Total",    value: stats.total,           color: "bg-white/10 text-white" },
                { label: "Pending",  value: stats.pending,         color: "bg-amber-500/20 text-amber-200" },
                { label: "Verified", value: stats.verified,        color: "bg-blue-500/20 text-blue-200" },
                { label: "Progress", value: stats.inProgress,      color: "bg-violet-500/20 text-violet-200" },
                { label: "Resolved", value: stats.resolved,        color: "bg-emerald-500/20 text-emerald-200" },
                { label: "Approval", value: stats.approvalPending, color: "bg-orange-500/20 text-orange-200" },
              ].map(s => (
                <div key={s.label} className={`px-4 py-2 rounded-xl ${s.color}`}>
                  <p className="text-xl font-bold leading-none">{s.value}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 mb-6 shadow-sm w-fit">
          {[
            { id: "complaints",  label: "Complaints" },
            { id: "assign",      label: "Assign Worker" },
            { id: "permissions", label: permissions.length ? `Permissions (${permissions.length})` : "Permissions" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === t.id ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === "complaints" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-800">{myDeptName ? `${myDeptName} — Complaint Queue` : "Complaint Queue"}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{visibleComplaints.length} complaints</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["all","pending","verified","in_progress","completed","rejected"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${statusFilter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {s === "all" ? `All (${complaints.length})` : `${s.replace(/_/g," ")} (${complaints.filter(c=>c.status===s).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/70">
                    {["Select","ID","Issue","Submitted By","Location","Status","Date","Actions"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <p className="text-slate-300 text-sm">
                          {myDeptName
                            ? `No ${statusFilter !== "all" ? `"${statusFilter}"` : ""} complaints in ${myDeptName} department`
                            : "No department assigned — ask Super Admin"}
                        </p>
                      </td>
                    </tr>
                  ) : visibleComplaints.map(c => (
                    <tr key={c._id}
                      className={`border-t border-slate-50 transition-colors ${selectedComplaintId === c._id ? "bg-blue-50/70" : "hover:bg-slate-50/50"}`}>
                      <td className="px-5 py-3.5">
                        <input type="radio" name="complaint"
                          checked={selectedComplaintId === c._id}
                          onChange={() => { setSelectedComplaintId(c._id); setAssignMsg(""); }}
                          className="w-4 h-4 accent-blue-600 cursor-pointer" />
                      </td>
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-400">#{c._id?.slice(-6)}</span></td>
                      <td className="px-5 py-3.5"><p className="text-sm font-medium text-slate-800 max-w-[180px] truncate">{c.issue || c.category || "—"}</p></td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{c.userId?.name || "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{c.city || "—"}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewComplaintId(c._id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition">View</button>
                          {c.status === "pending" && (
                            <button onClick={() => handleVerifyAutoAssign(c._id)} disabled={assigning}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-40 whitespace-nowrap">
                              ✓ Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ASSIGN TAB ── */}
        {activeTab === "assign" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Select Complaint</h2>
                <p className="text-xs text-slate-400 mt-0.5">Click a row to select, then assign a worker</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/70">
                      <th className="px-5 py-3 w-10" />
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Complaint</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length === 0 ? (
                      <tr><td colSpan={3} className="px-5 py-12 text-center text-sm text-slate-300">No complaints</td></tr>
                    ) : complaints.map(c => (
                      <tr key={c._id}
                        onClick={() => { setSelectedComplaintId(c._id); setAssignMsg(""); }}
                        className={`border-t border-slate-50 cursor-pointer transition-colors ${selectedComplaintId === c._id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                        <td className="px-5 py-3.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedComplaintId === c._id ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                            {selectedComplaintId === c._id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-slate-800">{c.issue || c.category}</p>
                          <p className="text-xs text-slate-400 mt-0.5">#{c._id?.slice(-6)} · {c.city || "—"}</p>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-colors ${selectedComplaint ? "border-blue-200 bg-blue-50/20" : "border-slate-100"}`}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Selected Complaint</p>
                {selectedComplaint ? (
                  <>
                    <p className="font-semibold text-slate-800">{selectedComplaint.issue || selectedComplaint.category}</p>
                    <p className="text-xs text-slate-400 mt-1">#{selectedComplaint._id?.slice(-6)} · {selectedComplaint.city || "—"}</p>
                    <div className="mt-2"><StatusBadge status={selectedComplaint.status} /></div>
                  </>
                ) : <p className="text-sm text-slate-300 italic">Click a row to select complaint</p>}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Workers ({workers.length})</p>
                {workers.length > 0 && (
                  <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
                    {workers.map(w => (
                      <div key={w._id} onClick={() => setSelectedWorkerId(w._id)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition border ${selectedWorkerId === w._id ? "bg-blue-50 border-blue-200" : "border-transparent hover:bg-slate-50"}`}>
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {w.name?.[0]?.toUpperCase() || "W"}
                        </div>
                        <p className="text-sm font-medium text-slate-700 flex-1">{w.name || w.email}</p>
                        {selectedWorkerId === w._id && <span className="text-blue-500 text-xs font-semibold">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <button onClick={handleManualAssign} disabled={!selectedComplaintId || assigning}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                    {assigning ? "Assigning…" : "Assign Selected Worker"}
                  </button>
                  <button onClick={handleAutoAssign} disabled={!selectedComplaintId || assigning}
                    className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
                    ⚡ Auto Assign (Least Load)
                  </button>
                </div>
                {assignMsg && (
                  <p className={`mt-3 text-sm font-medium rounded-xl px-3 py-2 ${assignMsg.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"}`}>
                    {assignMsg}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PERMISSIONS TAB ── */}
        {activeTab === "permissions" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-800">Permission Requests</h2>
                <p className="text-xs text-slate-400 mt-0.5">{permissions.length} requests</p>
              </div>
              {permissions.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{permissions.length}</span>}
            </div>
            <div className="p-6">
              {permissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-sm text-slate-400">No outstanding permission requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {permissions.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{p.assetId?.name || "Unknown asset"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Requested by {p.requestBy?.name || "Unknown"}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${p.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : p.status === "rejected" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {p.status || "pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complaint Detail */}
        {viewComplaintId && (
          <div className="mt-6">
            <ComplaintDetail
              complaintId={viewComplaintId}
              onClose={() => setViewComplaintId(null)}
              onStatusChange={async () => { await refreshComplaints(); setViewComplaintId(null); }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentAdminDashboard;