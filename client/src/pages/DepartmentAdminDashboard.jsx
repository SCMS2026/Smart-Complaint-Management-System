import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaints } from "../services/complaints";
import { fetchPermissions } from "../services/permissions";
import { fetchUsers } from "../services/auth";
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

    const loadComplaints = async () => {
      setLoading(true);
      try {
        const res = await fetchComplaints();
        if (res.success) {
          const data = res.complaints || [];
          setComplaints(data);

          const pending = data.filter(c => c.status === "pending").length;
          const verified = data.filter(c => c.status === "verified").length;
          const inProgress = data.filter(c => c.status === "in_progress").length;
          const waitingForUser = data.filter(c => c.status === "waiting_user").length;
          const resolved = data.filter(c => ["completed", "approved_by_user"].includes(c.status)).length;

          setStats({
            pending,
            verified,
            inProgress,
            waitingForUser,
            totalComplaints: data.length,
            resolved,
            pendingApprovals: data.filter(c => c.status === "user_approval_pending").length,
          });
        } else {
          setError(res.message || "Failed to load complaints");
        }
      } catch (err) {
        setError(err.message || "Error loading complaints");
      } finally {
        setLoading(false);
      }
    };

    const loadPermissions = async () => {
      const res = await fetchPermissions();
      if (res.success) {
        setPermissions(res.permissions || []);
      }
    };

    const loadWorkers = async () => {
      const res = await fetchUsers();
      if (res.success) {
        setWorkers(res.users.filter((u) => u.role === "worker"));
      }
    };

    loadComplaints();
    loadPermissions();
    loadWorkers();
  }, [nav]);

  const assignWorker = async (complaint) => {
    if (!selectedWorkerId) {
      setAssignMessage("Please select a worker to assign.");
      return;
    }

    const payload = {
      complaint_id: complaint._id,
      worker_id: selectedWorkerId,
      status: "assigned"
    };

    const res = await createWorkerTask(payload);
    if (res.success) {
      setAssignMessage("Complaint assigned to worker successfully.");
      await refreshData();
    } else {
      setAssignMessage(res.message || "Failed to assign worker.");
    }
  };

  const autoAssignToSelectedComplaint = async () => {
    if (!selectedComplaintId) {
      setAssignMessage("Please select a complaint first from table below.");
      return;
    }

    const res = await autoAssignWorker(selectedComplaintId);
    if (res.success) {
      setAssignMessage(`Complaint auto-assigned to worker: ${res.assignedWorker?.name || "unknown"}`);
      await refreshData();
    } else {
      setAssignMessage(res.message || "Auto assignment failed.");
    }
  };

  const refreshData = async () => {
    const res = await fetchComplaints();
    if (res.success) {
      setComplaints(res.complaints || []);
      const data = res.complaints || [];
      const pending = data.filter(c => c.status === "pending").length;
      const verified = data.filter(c => c.status === "verified").length;
      const inProgress = data.filter(c => c.status === "in_progress").length;
      const waitingForUser = data.filter(c => c.status === "waiting_user").length;
      const resolved = data.filter(c => ["completed", "approved_by_user"].includes(c.status)).length;

      setStats({
        pending,
        verified,
        inProgress,
        waitingForUser,
        totalComplaints: data.length,
        resolved,
        pendingApprovals: data.filter(c => c.status === "user_approval_pending").length,
      });
    }

    const permRes = await fetchPermissions();
    if (permRes.success) setPermissions(permRes.permissions || []);

    const workerRes = await fetchUsers();
    if (workerRes.success) setWorkers(workerRes.users.filter((u) => u.role === "worker"));
  };

  return (
    <div className="min-h-screen min-w-screen pt-20 p-6">
      <h1 className="text-3xl font-bold mb-6">Department Admin Dashboard</h1>
      {loading && <div>Loading complaints ...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold">Total</h3>
              <p className="text-3xl font-bold">{stats.totalComplaints}</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold">Pending</h3>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold">In Progress</h3>
              <p className="text-3xl font-bold">{stats.inProgress}</p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold">User Approval Pending</h3>
              <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <p className="font-semibold text-gray-700">Assign Worker</p>
            <p className="text-sm text-gray-500">Selected complaint: {selectedComplaintId ? selectedComplaintId.slice(-6) : "None"}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="border rounded px-3 py-2">
                <option value="">Select worker</option>
                {workers.map((w) => <option key={w._id} value={w._id}>{w.name} ({w.email})</option>)}
              </select>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => {
                const comp = complaints.find((c) => c._id === selectedComplaintId);
                if (!comp) { setAssignMessage('Select complaint first'); return; }
                assignWorker(comp);
              }}>Assign Worker</button>
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={autoAssignToSelectedComplaint}>Auto Assign</button>
            </div>
            {assignMessage && <p className="mt-2 text-green-700">{assignMessage}</p>}
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-bold mb-2">Complaint List</h2>
            {complaints.length === 0 && <div>No complaints.</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">#</th>
                    <th className="p-2">Issue</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedComplaintId(c._id)}>
                      <td className="p-2">{c._id.slice(-6)}</td>
                      <td className="p-2">{c.issue || c.category}</td>
                      <td className="p-2">{c.location}, {c.city}</td>
                      <td className="p-2 capitalize">{c.status}</td>
                      <td className="p-2"><button className="text-blue-600 hover:underline" onClick={(e) => {e.stopPropagation(); setSelectedComplaintId(c._id);}}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-3">Permission Requests</h2>
            {permissions.length === 0 ? <p>No permission requests yet.</p> : (
              <ul className="space-y-2">
                {permissions.map((p) => (
                  <li key={p._id} className="flex justify-between border p-2 rounded">
                    <span>{p.assetId?.name || 'Unknown asset'} by {p.requestBy?.name || 'Unknown'}</span>
                    <span className="text-sm font-semibold">{p.status || 'pending'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedComplaintId && <ComplaintDetail complaintId={selectedComplaintId} onClose={() => setSelectedComplaintId(null)} onStatusChange={refreshData} />}
        </>
      )}
    </div>
  );
};

export default DepartmentAdminDashboard;
