import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyPermissions, updatePermissionStatus, completePermission } from "../services/permissions";

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400", border: "border-yellow-200" },
  approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  completed: { label: "Completed", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  cancelled: { label: "Cancelled", bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200" }
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    low: 'bg-gray-50 text-gray-600',
    medium: 'bg-blue-50 text-blue-600',
    high: 'bg-orange-50 text-orange-600',
    critical: 'bg-red-50 text-red-600'
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[priority] || colors.medium}`}>{priority}</span>;
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

const PermissionCard = ({ permission, onComplete }) => {
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    if (!confirm("Mark this permission as completed?")) return;
    setCompleting(true);
    const res = await completePermission(permission._id, "Work completed successfully");
    if (res.success) {
      alert("Permission marked as completed!");
      onComplete();
    } else {
      alert(res.message || "Failed to complete");
    }
    setCompleting(false);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">{permission.assetId?.name || 'Asset'}</h3>
            <p className="text-sm text-slate-500">Code: {permission.assetId?.assetCode || 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={permission.status} />
            <PriorityBadge priority={permission.priority} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Asset Type */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Type:</span>
          <span className="font-medium capitalize">{permission.assetId?.type?.replace('_', ' ') || 'N/A'}</span>
        </div>

        {/* Location */}
        {permission.location && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-slate-500">📍</span>
            <span>{permission.location.address}, {permission.location.area}, {permission.location.city}</span>
          </div>
        )}

        {/* Work Details */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Work Type</span>
            <span className="text-sm capitalize font-medium">{permission.workType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Duration</span>
            <span className="text-sm">{formatDate(permission.proposedStartDate)} - {formatDate(permission.proposedEndDate)}</span>
          </div>
          {permission.estimatedCost && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Est. Cost</span>
              <span className="text-sm font-medium">₹{permission.estimatedCost.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <p className="text-sm font-semibold text-slate-600 mb-1">Description</p>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{permission.reason}</p>
        </div>

        {/* Review Info (if reviewed) */}
        {permission.reviewedBy && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm font-semibold text-slate-600 mb-1">Review</p>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">Reviewed by: <span className="font-medium">{permission.reviewedBy?.name || 'Admin'}</span></span>
            </div>
            {permission.reviewComments && (
              <p className="text-sm text-slate-600 italic">"{permission.reviewComments}"</p>
            )}
          </div>
        )}

        {/* Completion Info */}
        {permission.completionNotes && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm font-semibold text-slate-600 mb-1">Completion Notes</p>
            <p className="text-sm text-slate-600 italic">"{permission.completionNotes}"</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
        {permission.status === 'approved' && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {completing ? 'Completing...' : '✓ Mark Completed'}
          </button>
        )}
      </div>
    </div>
  );
};

const PermissionRequests = () => {
  const nav = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "contractor") {
      nav("/login");
      return;
    }
    loadRequests();
  }, [nav]);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMyPermissions();
      if (res.success) {
        setRequests(res.permissions || []);
      } else {
        setError(res.message || "Failed to load requests");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = filter === "all" 
    ? requests 
    : requests.filter(r => r.status === filter);

  const stats = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading permission requests…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-white p-8 shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.06] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, #818cf8, transparent)", transform: "translate(25%,-25%)" }} />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Permission Requests</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">My Requests</h1>
            <p className="text-sm text-slate-400 mt-1">Track and manage your property permission requests</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "All Requests", value: stats.all, color: "bg-white border-slate-200 text-slate-700", active: filter === 'all' },
            { label: "Pending", value: stats.pending, color: "bg-yellow-50 border-yellow-100 text-yellow-700", active: filter === 'pending' },
            { label: "Approved", value: stats.approved, color: "bg-emerald-50 border-emerald-100 text-emerald-700", active: filter === 'approved' },
            { label: "Completed", value: stats.completed, color: "bg-blue-50 border-blue-100 text-blue-700", active: filter === 'completed' }
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setFilter(s.active ? 'all' : s.label.toLowerCase())}
              className={`rounded-2xl border p-4 shadow-sm transition ${s.color} ${s.active ? 'ring-2 ring-sky-500' : ''}`}
            >
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-60">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-slate-400 text-lg">
              {filter === "all" ? "No permission requests yet" : `No ${filter} requests`}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {filter === "all" ? "Browse properties and request permissions to get started" : "Try a different filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredRequests.map((request) => (
              <PermissionCard 
                key={request._id} 
                permission={request} 
                onComplete={loadRequests}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionRequests;