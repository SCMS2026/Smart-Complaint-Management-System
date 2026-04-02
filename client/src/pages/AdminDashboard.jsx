import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchComplaints } from "../services/complaints";
import { fetchPermissions } from "../services/permissions";
import { importAssets } from "../services/assets";
import { fetchUsers } from "../services/auth";
import { createWorkerTask } from "../services/workerTask";
import ComplaintDetail from "./ComplaintDetail";

const AdminDashboard = () => {
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

  // asset import state
  const [excelFile, setExcelFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');


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

    const loadComplaints = async () => {
      try {
        const res = await fetchComplaints();
        if (res.success) {
          const data = res.complaints || [];
          setComplaints(data);

          // Calculate statistics
          const pending = data.filter(c => c.status === "pending").length;
          const verified = data.filter(c => c.status === "verified").length;
          const inProgress = data.filter(c => c.status === "in_progress").length;
          const waitingForUser = data.filter(c => c.status === "waiting_user").length;
          const resolved = data.filter(c => c.status === "resolved").length;

          setStats({
            pending,
            verified,
            inProgress,
            waitingForUser,
            totalComplaints: data.length,
            resolved,
            pendingApprovals: data.filter(c => c.status === "pending").length,
          });
        } else {
          setError(res.message || "Failed to load complaints");
        }
      } catch {
        setError("Error loading complaints");
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
        const admin = JSON.parse(localStorage.getItem("user") || "null");
        const filtered = res.users.filter(
          (u) => u.role === "worker" && u.department_id === admin?.department_id
        );
        setWorkers(filtered);
      }
    };

    loadComplaints();
    loadPermissions();
    loadWorkers();
  }, [nav]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-200 text-yellow-800";
      case "verified":
        return "bg-green-200 text-green-800";
      case "in_progress":
        return "bg-orange-200 text-orange-800";
      case "waiting_user":
        return "bg-red-200 text-red-800";
      case "resolved":
        return "bg-blue-200 text-blue-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      pending: "Pending",
      verified: "Verified",
      in_progress: "In Progress",
      waiting_user: "Waiting User",
      resolved: "Resolved",
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!excelFile) return setImportStatus("Please select a file");
    setImportStatus("Importing assets...");
    const res = await importAssets(excelFile);
    if (res.success) {
      let msg = `Added ${res.added} asset${res.added === 1 ? '' : 's'}`;
      if (res.errors && res.errors.length) {
        msg += `, ${res.errors.length} row${res.errors.length === 1 ? '' : 's'} skipped`;
      }
      setImportStatus(msg);
    } else {
      setImportStatus(res.message || "Import failed");
    }
  };

  const downloadTemplate = () => {
    const csv = "name,location,category\nExample Asset,Office,Electronics\n";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const assignWorker = async (complaint) => {
    if (!selectedWorkerId) {
      setAssignMessage('Please select a worker to assign.');
      return;
    }

    const payload = {
      complaint_id: complaint._id,
      worker_id: selectedWorkerId,
      status: 'assigned'
    };

    const res = await createWorkerTask(payload);
    if (res.success) {
      setAssignMessage(`Complaint assigned to worker successfully.`);
      await fetchComplaints().then((r) => {
        if (r.success) setComplaints(r.complaints || []);
      });
    } else {
      setAssignMessage(res.message || 'Failed to assign worker.');
    }
  };

  return (
    <div className="min-h-screen min-w-screen pt-20 ">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-100">
          <div className="text-lg text-gray-600">Loading complaints...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div className="p-6">
          {/* Asset import panel */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Import Assets (Excel)</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="border p-1"
              />
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Upload
              </button>
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Download Template
              </button>
            </div>
            {importStatus && <p className="mt-2 text-sm text-gray-700">{importStatus}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Excel must include headers <code>name</code>, <code>location</code>, and <code>category</code> (case-insensitive).
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Pending Complaints */}
            <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md flex items-center gap-4">
              <div className="bg-blue-500 p-4 rounded">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-1.414 0l-2.414-2.414a1 1 0 00-.707-.293H4a1 1 0 110-2V4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-90">Pending Complaints</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>

            {/* Verified Complaints */}
            <div className="bg-green-600 text-white p-6 rounded-lg shadow-md flex items-center gap-4">
              <div className="bg-green-500 p-4 rounded">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-90">Verified Complaints</p>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-orange-500 text-white p-6 rounded-lg shadow-md flex items-center gap-4">
              <div className="bg-orange-400 p-4 rounded">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M14.828 14.828a4 4 0 01-5.656 0M17.657 17.657a8 8 0 10-11.314 0m5.858-5.858a2 2 0 11-2.828-2.829m2.828 2.829L9.172 9.172" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-90">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>

            {/* Waiting for User */}
            <div className="bg-red-600 text-white p-6 rounded-lg shadow-md flex items-center gap-4">
              <div className="bg-red-500 p-4 rounded">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.36a6 6 0 008.367 8.529m7.016.036a7 7 0 11-9.9-9.9m5.116 8.08a7 7 0 01-9.9-9.9" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm opacity-90">Waiting for User</p>
                <p className="text-2xl font-bold">{stats.waitingForUser}</p>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Complaints */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Complaints</h2>
              {complaints.length === 0 && (
                <div className="text-center py-8 text-gray-500">No complaints found</div>
              )}

              {complaints.length > 0 && (
                <>
                  <div className="mb-4 bg-gray-100 p-4 rounded">
                    <p className="font-semibold text-gray-700">Assign Worker to Selected Complaint</p>
                    <p className="text-sm text-gray-600">Selected Complaint: {selectedComplaintId ? selectedComplaintId.slice(-6) : 'None'}</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        className="border rounded px-3 py-2"
                      >
                        <option value="">Select worker</option>
                        {workers.map((w) => (
                          <option key={w._id} value={w._id}>{w.name} ({w.email})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (!selectedComplaintId) {
                            setAssignMessage('Please select a complaint first from table below.');
                            return;
                          }
                          const comp = complaints.find(c => c._id === selectedComplaintId);
                          if (!comp) {
                            setAssignMessage('Selected complaint not found.');
                            return;
                          }
                          assignWorker(comp);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Assign Worker
                      </button>
                    </div>
                    {assignMessage && <p className="text-sm text-green-700 mt-2">{assignMessage}</p>}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Issue</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.slice(0, 5).map((complaint) => (
                        <tr key={complaint._id} onClick={() => setSelectedComplaintId(complaint._id)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <td className="py-3 px-4 text-gray-700">{complaint._id?.slice(-4) || "—"}</td>
                          <td className="py-3 px-4 text-gray-700">{complaint.userId?.name || "—"}</td>
                          <td className="py-3 px-4 text-gray-700">{complaint.issue || "—"}</td>
                          <td className="py-3 px-4 text-gray-700">{complaint.location || "—"}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                              {formatStatus(complaint.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>)}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Total Complaints: <strong>{stats.totalComplaints}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Resolved Complaints: <strong>{stats.resolved}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700">Pending Approvals: <strong>{stats.pendingApprovals}</strong></span>
                  </div>
                </div>
              </div>

              {/* Permission Requests */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Permission Requests</h2>
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div key={permission._id} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700">{permission.assetId?.name || "Asset"}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded ${
                        permission.status === "approved" 
                          ? "bg-blue-200 text-blue-800" 
                          : permission.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                      }`}>
                        {permission.status.charAt(0).toUpperCase() + permission.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaintId && (
        <ComplaintDetail
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onStatusChange={async () => {
            // Reload complaints when status changes
            const res = await fetchComplaints();
            if (res.success) {
              setComplaints(res.complaints || []);
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
