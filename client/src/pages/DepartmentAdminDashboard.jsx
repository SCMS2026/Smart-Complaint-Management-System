import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaints, updateComplaintStatusRequest } from "../services/complaints";
import { fetchPermissions } from "../services/permissions";
import { fetchUsers, getTokenPayload } from "../services/auth";
import { createWorkerTask, autoAssignWorker } from "../services/workerTask";
import ComplaintDetail from "./ComplaintDetail";

const DepartmentAdminDashboard = () => {
  const nav = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    inProgress: 0,
    waitingForUser: 0,
    totalComplaints: 0,
    resolved: 0,
    pendingApprovals: 0,
  });
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
    if (!user || user.role !== "department_admin") {
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
          const resolved = data.filter((c) => ["completed", "approved_by_user", "resolved"].includes(c.status)).length;
          const pendingApprovals = data.filter((c) => c.status === "user_approval_pending").length;
          setStats({
            pending,
            verified,
            inProgress,
            waitingForUser,
            totalComplaints: data.length,
            resolved,
            pendingApprovals,
          });
        } else {
          setError(complaintsRes.message || "Failed to load complaints");
        }

        if (permissionsRes.success) {
          setPermissions(permissionsRes.permissions || []);
        }

        if (usersRes.success) {
          setWorkers(usersRes.users.filter((u) => u.role === "worker"));
        }
      } catch (err) {
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [nav]);

  const refreshData = async () => {
    const res = await fetchComplaints();
    if (res.success) {
      const data = res.complaints || [];
      setComplaints(data);
      const pending = data.filter((c) => c.status === "pending").length;
      const verified = data.filter((c) => c.status === "verified").length;
      const inProgress = data.filter((c) => c.status === "in_progress").length;
      const waitingForUser = data.filter((c) => c.status === "waiting_user").length;
      const resolved = data.filter((c) => ["completed", "approved_by_user", "resolved"].includes(c.status)).length;
      const pendingApprovals = data.filter((c) => c.status === "user_approval_pending").length;
      setStats({
        pending,
        verified,
        inProgress,
        waitingForUser,
        totalComplaints: data.length,
        resolved,
        pendingApprovals,
      });
    }

    const permRes = await fetchPermissions();
    if (permRes.success) setPermissions(permRes.permissions || []);

    const userRes = await fetchUsers();
    if (userRes.success) setWorkers(userRes.users.filter((u) => u.role === "worker"));
  };

  const assignWorker = async (complaint) => {
    if (!selectedWorkerId) {
      setAssignMessage("Please select a worker.");
      return;
    }

    const res = await createWorkerTask({
      complaint_id: complaint._id,
      worker_id: selectedWorkerId,
      status: "assigned",
    });

    if (res.success) {
      setAssignMessage("Worker assigned successfully.");
      await refreshData();
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
      setAssignMessage(`Auto-assigned to ${res.assignedWorker?.name || "a worker"}.`);
      await refreshData();
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
        await refreshData();
      } else {
        setAssignMessage(res.message || "Failed to verify and assign complaint.");
      }
    } catch (err) {
      setAssignMessage(err.message || "Error processing complaint.");
    }
  };

  const selectedComplaint = complaints.find((c) => c._id === selectedComplaintId);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-4xl bg-linear-to-r from-slate-800 to-slate-900 text-white p-10 shadow-xl mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Department Admin Hub</p>
          <h1 className="mt-4 text-4xl font-bold">Department Administrator Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300 leading-7">Oversee department complaints, approvals, and worker assignments with a clean overview panel.</p>
        </div>

        {error && (
          <div className="rounded-[1.75rem] bg-red-50 p-6 shadow-sm text-center text-red-700 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[1.75rem] bg-white p-12 shadow-sm text-center text-slate-500">Loading department dashboard…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm font-semibold text-slate-500">Total Complaints</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.totalComplaints}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm font-semibold text-slate-500">Pending</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.pending}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm font-semibold text-slate-500">In Progress</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.inProgress}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm font-semibold text-slate-500">Pending Approvals</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.pendingApprovals}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr] mb-6">
              <section className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Department complaints</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Complaint queue</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{complaints.length} items</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Issue</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assigned</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint) => (
                        <tr key={complaint._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600">{complaint._id.slice(-6)}</td>
                          <td className="px-4 py-3">{complaint.issue || complaint.category}</td>
                          <td className="px-4 py-3 capitalize">{complaint.status}</td>
                          <td className="px-4 py-3">{complaint.assignedWorker?.name || "—"}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold" onClick={() => setSelectedComplaintId(complaint._id)}>View</button>
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
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Assignment tools</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Worker dispatch</h2>
                </div>
                <div className="space-y-4">
                  <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                    <option value="">Choose worker</option>
                    {workers.map((worker) => (
                      <option key={worker._id} value={worker._id}>{worker.name || worker.email}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const complaint = complaints.find((c) => c._id === selectedComplaintId);
                      if (!complaint) {
                        setAssignMessage("Select a complaint first.");
                        return;
                      }
                      assignWorker(complaint);
                    }}
                    className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3 hover:bg-slate-800 transition"
                  >
                    Assign Worker
                  </button>
                  <button onClick={autoAssignToSelectedComplaint} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:bg-slate-100 transition">Auto Assign</button>
                  <p className="text-sm text-slate-600">Selected complaint: {selectedComplaint ? selectedComplaint.issue || selectedComplaint.category : "None"}</p>
                  {assignMessage && <p className="text-sm text-slate-600">{assignMessage}</p>}
                </div>
              </section>
            </div>

            <section className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Request queue</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Permission approvals</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{permissions.length} requests</span>
              </div>
              {permissions.length === 0 ? (
                <p className="text-sm text-slate-500">There are no outstanding permission requests.</p>
              ) : (
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div key={permission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex justify-between gap-4 items-center">
                        <div>
                          <p className="font-semibold text-slate-900">{permission.assetId?.name || "Unknown asset"}</p>
                          <p className="text-sm text-slate-500">Requested by {permission.requestBy?.name || "Unknown"}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">{permission.status || "pending"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {selectedComplaintId && (
              <div className="mt-6">
                <ComplaintDetail complaintId={selectedComplaintId} onClose={() => setSelectedComplaintId(null)} onStatusChange={refreshData} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentAdminDashboard;
