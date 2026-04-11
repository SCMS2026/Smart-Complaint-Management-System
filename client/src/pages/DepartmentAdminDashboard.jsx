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
  const [selectedComplaintId, setSelectedComplaintId] = useState(null); // assignment માટે
  const [viewComplaintId, setViewComplaintId] = useState(null); // view/detail માટે
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
          setStats({
            pending: data.filter((c) => c.status === "pending").length,
            verified: data.filter((c) => c.status === "verified").length,
            inProgress: data.filter((c) => c.status === "in_progress").length,
            waitingForUser: data.filter((c) => c.status === "waiting_user").length,
            totalComplaints: data.length,
            resolved: data.filter((c) => ["completed", "approved_by_user", "resolved"].includes(c.status)).length,
            pendingApprovals: data.filter((c) => c.status === "user_approval_pending").length,
          });
        } else {
          setError(complaintsRes.message || "Failed to load complaints");
        }

        if (permissionsRes.success) setPermissions(permissionsRes.permissions || []);
        if (usersRes.success) setWorkers(usersRes.users.filter((u) => u.role === "worker"));
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
      setStats({
        pending: data.filter((c) => c.status === "pending").length,
        verified: data.filter((c) => c.status === "verified").length,
        inProgress: data.filter((c) => c.status === "in_progress").length,
        waitingForUser: data.filter((c) => c.status === "waiting_user").length,
        totalComplaints: data.length,
        resolved: data.filter((c) => ["completed", "approved_by_user", "resolved"].includes(c.status)).length,
        pendingApprovals: data.filter((c) => c.status === "user_approval_pending").length,
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
      setAssignMessage("✅ Worker assigned successfully.");
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
      setAssignMessage(`✅ Auto-assigned to ${res.assignedWorker?.name || "a worker"}.`);
      await refreshData();
    } else {
      setAssignMessage(res.message || "Auto assignment failed.");
    }
  };

  const verifyAndAutoAssign = async (complaintId) => {
    try {
      setSelectedComplaintId(complaintId);
      setAssignMessage("Processing...");

      const verifyRes = await updateComplaintStatusRequest(complaintId, "verified");
      if (!verifyRes.success) {
        setAssignMessage(verifyRes.message || "Failed to verify complaint.");
        return;
      }

      const assignRes = await autoAssignWorker(complaintId);
      if (assignRes.success) {
        setAssignMessage(`✅ Verified & assigned to ${assignRes.assignedWorker?.name || "a worker"}.`);
        await refreshData();
      } else {
        setAssignMessage(assignRes.message || "Verified but auto-assignment failed.");
        await refreshData();
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
                        <th className="px-4 py-3">Select</th>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Issue</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assigned</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map((complaint) => (
                        <tr
                          key={complaint._id}
                          className={`border-b border-slate-200 transition-colors ${
                            selectedComplaintId === complaint._id
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          {/* ✅ Radio - ફક્ત select કરે, view નહીં */}
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="selectedComplaint"
                              checked={selectedComplaintId === complaint._id}
                              onChange={() => {
                                setSelectedComplaintId(complaint._id);
                                setAssignMessage("");
                              }}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 text-slate-600">{complaint._id.slice(-6)}</td>
                          <td className="px-4 py-3">{complaint.issue || complaint.category}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              complaint.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              complaint.status === "verified" ? "bg-blue-100 text-blue-700" :
                              complaint.status === "in_progress" ? "bg-purple-100 text-purple-700" :
                              complaint.status === "resolved" ? "bg-green-100 text-green-700" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">{complaint.assignedWorker?.name || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {/* ✅ View - ફક્ત detail open કરે, select નહીં */}
                              <button
                                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                                onClick={() => setViewComplaintId(complaint._id)}
                              >
                                View
                              </button>
                              {complaint.status === "pending" && (
                                <button
                                  className="text-green-600 hover:text-green-800 text-sm font-semibold"
                                  onClick={() => verifyAndAutoAssign(complaint._id)}
                                  title="Verify and auto-assign to a worker"
                                >
                                  Auto
                                </button>
                              )}
                            </div>
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

                {/* ✅ Selected complaint info card */}
                <div className={`mb-4 rounded-2xl p-4 border ${selectedComplaint ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Selected Complaint</p>
                  {selectedComplaint ? (
                    <>
                      <p className="font-semibold text-slate-900">{selectedComplaint.issue || selectedComplaint.category}</p>
                      <p className="text-xs text-slate-500 mt-1">ID: {selectedComplaint._id.slice(-6)} · Status: {selectedComplaint.status}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">Radio button દબાવો complaint select કરવા</p>
                  )}
                </div>

                <div className="space-y-4">
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
                  >
                    <option value="">Choose worker</option>
                    {workers.map((worker) => (
                      <option key={worker._id} value={worker._id}>{worker.name || worker.email}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (!selectedComplaint) {
                        setAssignMessage("Select a complaint first.");
                        return;
                      }
                      assignWorker(selectedComplaint);
                    }}
                    disabled={!selectedComplaintId}
                    className="w-full rounded-2xl bg-slate-900 text-white px-4 py-3 hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Assign Worker
                  </button>
                  <button
                    onClick={autoAssignToSelectedComplaint}
                    disabled={!selectedComplaintId}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Auto Assign
                  </button>

                  {assignMessage && (
                    <p className={`text-sm font-medium ${assignMessage.startsWith("✅") ? "text-green-600" : "text-slate-600"}`}>
                      {assignMessage}
                    </p>
                  )}
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

            {/* ✅ viewComplaintId વાપરે છે - selectedComplaintId નહીં */}
            {viewComplaintId && (
              <div className="mt-6">
                <ComplaintDetail
                  complaintId={viewComplaintId}
                  onClose={() => setViewComplaintId(null)}
                  onStatusChange={refreshData}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentAdminDashboard;