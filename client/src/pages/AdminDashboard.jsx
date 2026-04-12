import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaints, updateComplaintStatusRequest } from "../services/complaints";
import { fetchPermissions } from "../services/permissions";
import { importAssets } from "../services/assets";
import { fetchUsers, getTokenPayload } from "../services/auth";
import { createWorkerTask, autoAssignWorker } from "../services/workerTask";
import ComplaintDetail from "./ComplaintDetail";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-violet-100 text-violet-700",
  waiting_user: "bg-red-100 text-red-700",
  resolved: "bg-sky-100 text-sky-700",
};

const statusLabels = {
  pending: "Pending",
  verified: "Verified",
  in_progress: "In Progress",
  waiting_user: "Waiting User",
  resolved: "Resolved",
};

const InfoCard = ({ label, value, description, accent }) => (
  <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
    {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-700"}`}>
    {statusLabels[status] || status}
  </span>
);

const AdminDashboard = () => {
  const nav = useNavigate();
  const [stats, setStats] = useState({ pending: 0, verified: 0, inProgress: 0, waitingForUser: 0, totalComplaints: 0, resolved: 0, pendingApprovals: 0 });
  const [excelFile, setExcelFile] = useState(null);
  const [importStatus, setImportStatus] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [assignMessage, setAssignMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || (user.role !== "admin" && user.role !== "department_admin")) {
      nav("/");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [complaintsRes, permissionsRes, usersRes] = await Promise.all([
          fetchComplaints(),
          fetchPermissions(),
          fetchUsers(),
        ]);

        if (complaintsRes.success) {
          const data = complaintsRes.complaints || [];
          setComplaints(data);
          const pending = data.filter((c) => c.status === "pending").length;
          const verified = data.filter((c) => c.status === "verified").length;
          const inProgress = data.filter((c) => c.status === "in_progress").length;
          const waitingForUser = data.filter((c) => c.status === "waiting_user").length;
          const resolved = data.filter((c) => c.status === "resolved").length;
          setStats({
            pending,
            verified,
            inProgress,
            waitingForUser,
            totalComplaints: data.length,
            resolved,
            pendingApprovals: data.filter((c) => c.status === "pending").length,
          });
        } else {
          setError(complaintsRes.message || "Failed to load complaints");
        }

        if (permissionsRes.success) {
          setPermissions(permissionsRes.permissions || []);
        }

        if (usersRes.success) {
          const admin = JSON.parse(localStorage.getItem("user") || "null");
          const filteredWorkers = usersRes.users.filter((u) => u.role === "worker" || u.department_id === admin?.department_id);
          setWorkers(filteredWorkers);
        }
      } catch (err) {
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [nav]);

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!excelFile) return setImportStatus("Please select a file");
    setImportStatus("Importing assets...");
    const res = await importAssets(excelFile);
    if (res.success) {
      let msg = `Added ${res.added || 0} asset`;
      if (res.errors?.length) msg += `, ${res.errors.length} row skipped`;
      setImportStatus(msg);
    } else {
      setImportStatus(res.message || "Import failed");
    }
  };

  const downloadTemplate = () => {
    const csv = "name,location,category\nExample Asset,Office,Electronics\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assets-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const assignWorker = async (complaint) => {
    if (!selectedWorkerId) {
      setAssignMessage("Please select a worker to assign.");
      return;
    }

    const res = await createWorkerTask({ complaint_id: complaint._id, worker_id: selectedWorkerId, status: "assigned" });
    if (res.success) {
      setAssignMessage("Complaint assigned to worker successfully.");
      const refreshed = await fetchComplaints();
      if (refreshed.success) setComplaints(refreshed.complaints || []);
    } else {
      setAssignMessage(res.message || "Failed to assign worker.");
    }
  };

  const autoAssignToSelectedComplaint = async () => {
    if (!selectedComplaintId) {
      setAssignMessage("Please select a complaint first.");
      return;
    }
    const res = await autoAssignWorker(selectedComplaintId);
    if (res.success) {
      setAssignMessage(`Complaint auto-assigned to worker: ${res.workerName || ""}`);
      const refreshed = await fetchComplaints();
      if (refreshed.success) setComplaints(refreshed.complaints || []);
    } else {
      setAssignMessage(res.message || "Auto assignment failed.");
    }
  };

  const verifyAndAutoAssign = async (complaintId) => {
    try {
      setAssignMessage("Processing...");
      console.log("🔍 Token Payload before request:", getTokenPayload());
      const res = await updateComplaintStatusRequest(complaintId, 'verified');
      if (res.success) {
        setAssignMessage("Complaint verified and auto-assigned to worker!");
        const refreshed = await fetchComplaints();
        if (refreshed.success) setComplaints(refreshed.complaints || []);
      } else {
        setAssignMessage(res.message || "Failed to verify and assign complaint.");
      }
    } catch (err) {
      setAssignMessage(err.message || "Error processing complaint.");
    }
  };

  const selectedComplaint = complaints.find((c) => c._id === selectedComplaintId);

  return (
    <div className="min-h-screen bg-slate-50 pt-25 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 shadow-xl mb-8">
          <p className="text-sm uppercase text-slate-400">Admin Command Center</p>
          <h1 className="mt-4 text-4xl font-bold">Administrator Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300 leading-7">Manage complaints, assign workers, and import assets from a unified operations hub.</p>
        </div>

        {loading ? (
          <div className="rounded-[1.75rem] bg-white p-12 shadow-sm text-center text-slate-500">Loading dashboard data…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Total Complaints" value={stats.totalComplaints} />
              <InfoCard label="Pending" value={stats.pending} description="Needs review" />
              <InfoCard label="Verified" value={stats.verified} description="Passed initial checks" />
              <InfoCard label="Resolved" value={stats.resolved} description="Completed cases" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr] mb-6">
              <section className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
                  <div>
                    <p className="text-sm uppercase text-slate-500">Recent complaints</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Active ticket queue</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{complaints.length} tickets</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Issue</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.slice(0, 10).map((complaint) => (
                        <tr key={complaint._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600">{complaint._id.slice(-6)}</td>
                          <td className="px-4 py-3">{complaint.issue || complaint.category}</td>
                          <td className="px-4 py-3">{complaint.location}</td>
                          <td className="px-4 py-3"><StatusBadge status={complaint.status} /></td>
                          <td className="px-4 py-3 flex gap-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-sm font-semibold" 
                              onClick={() => setSelectedComplaintId(complaint._id)}
                            >
                              Select
                            </button>
                            {complaint.status === 'pending' && (
                              <button 
                                className="text-green-600 hover:text-green-800 text-sm font-semibold" 
                                onClick={() => verifyAndAutoAssign(complaint._id)}
                                title="Verify complaint and automatically assign to a worker"
                              >
                                Auto
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
                <div className="mb-6">
                  <p className="text-sm uppercase text-slate-500">Assignment</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Worker dispatch</h2>
                </div>
                <div className="space-y-4">
                  <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                    <option value="">Choose worker</option>
                    {workers.map((worker) => (
                      <option key={worker._id} value={worker._id}>{worker.name || worker.email}</option>
                    ))}
                  </select>
                  <button onClick={() => {
                    const complaint = complaints.find((item) => item._id === selectedComplaintId);
                    if (!complaint) { setAssignMessage("Select a complaint first."); return; }
                    assignWorker(complaint);
                  }} className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">Assign Worker</button>
                  <button onClick={autoAssignToSelectedComplaint} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Auto Assign</button>
                  <p className="text-sm text-slate-600">Selected complaint: {selectedComplaint ? selectedComplaint.issue || selectedComplaint.category : "None"}</p>
                  {assignMessage && <p className="text-sm text-slate-600">{assignMessage}</p>}
                </div>
              </section>
            </div>

            <section className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <p className="text-sm uppercase text-slate-500">Permissions</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pending approvals</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{permissions.length} requests</span>
              </div>
              {permissions.length === 0 ? (
                <p className="text-sm text-slate-500">No pending permission requests.</p>
              ) : (
                <div className="grid gap-4">
                  {permissions.map((permission) => (
                    <div key={permission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{permission.assetId?.name || "Asset request"}</p>
                          <p className="text-sm text-slate-500">Requested by {permission.requestBy?.name || "Unknown"}</p>
                        </div>
                        <span className="text-xs uppercase font-semibold text-slate-500">{permission.status || "pending"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {selectedComplaintId && (
              <div className="mt-6">
                <ComplaintDetail complaintId={selectedComplaintId} onClose={() => setSelectedComplaintId(null)} onStatusChange={() => {
                  fetchComplaints().then((r) => { if (r.success) setComplaints(r.complaints || []); });
                }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
