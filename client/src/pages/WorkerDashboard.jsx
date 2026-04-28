import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchWorkerTasks, updateWorkerTaskStatus } from "../services/workerTask";

// Convert image file to base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const STATUS_CONFIG = {
  assigned:  { label: "Assigned",  bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400",  border: "border-indigo-200"  },
  started:   { label: "Started",   bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400",  border: "border-violet-200"  },
  completed: { label: "Completed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "bg-slate-50", text: "text-slate-500", dot: "bg-slate-300", border: "border-slate-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// Photo upload box
const PhotoUpload = ({ label, existingUrl, onFileSelect, preview }) => {
  const ref = useRef();
  const displaySrc = preview || existingUrl;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      {displaySrc ? (
        <div className="relative group">
          <img src={displaySrc} alt={label} className="w-full h-44 object-cover rounded-xl border border-slate-200" />
          <button
            onClick={() => ref.current.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl text-white text-xs font-semibold"
          >
            Change Photo
          </button>
        </div>
      ) : (
        <button
          onClick={() => ref.current.click()}
          className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-300 hover:text-blue-400 transition bg-slate-50"
        >
          <span className="text-2xl">📷</span>
          <span className="text-xs font-medium">Upload {label}</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])} />
    </div>
  );
};

const ContractorDashboard = () => {
  const nav = useNavigate();
  const location = useLocation();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Active tab state
  const [activeTab, setActiveTab] = useState("tasks");

  // Per-task photo state
  const [photoState, setPhotoState] = useState({});
  // Per-task uploading state
  const [uploading, setUploading] = useState({});

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWorkerTasks();
      if (res.success) {
        setTasks(res.workerTasks || []);
      } else {
        setError(res.message || "Failed to load tasks");
        console.error("fetchWorkerTasks failed:", res.message);
      }
    } catch (err) {
      setError(err.message || "Network error — is the server running?");
      console.error("loadTasks exception:", err);
    }
    setLoading(false);
  };

  // Determine active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('properties')) {
      setActiveTab('properties');
    } else if (path.includes('permissions')) {
      setActiveTab('permissions');
    } else {
      setActiveTab('tasks');
    }
  }, [location]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || (user.role !== "contractor" && user.role !== "worker")) {
      nav("/");
      return;
    }
    
    // Only load tasks if we're on the tasks tab
    if (activeTab === 'tasks') {
      loadTasks();
    }
  }, [activeTab, nav]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };

  const setTaskPhoto = (taskId, key, value) => {
    setPhotoState((prev) => ({ ...prev, [taskId]: { ...prev[taskId], [key]: value } }));
  };

  const handlePhotoSelect = async (taskId, type, file) => {
    const preview = URL.createObjectURL(file);
    setTaskPhoto(taskId, `${type}File`, file);
    setTaskPhoto(taskId, `${type}Preview`, preview);
  };

  const updateTask = async (task, newStatus) => {
    setUploading((prev) => ({ ...prev, [task._id]: true }));
    setError("");
    try {
      const photos = photoState[task._id] || {};
      const payload = { status: newStatus };

      if (photos.beforeFile) {
        payload.before_photo = await toBase64(photos.beforeFile);
      }
      if (photos.afterFile) {
        payload.after_photo = await toBase64(photos.afterFile);
      }

      const res = await updateWorkerTaskStatus(task._id, payload);
      if (!res.success) {
        setError(res.message || "Failed to update task");
        return;
      }

      showSuccess(
        newStatus === "started"   ? "Work started! Complaint marked In Progress." :
        newStatus === "completed" ? "Task completed! Sent for user approval." :
        "Task reset to Assigned."
      );
      await loadTasks();
    } catch (err) {
      setError(err.message || "Operation failed");
    } finally {
      setUploading((prev) => ({ ...prev, [task._id]: false }));
    }
  };

  const statusCount = (status) => tasks.filter((t) => t.status === status).length;

  // Tab Navigation Component
  const TabNav = () => (
    <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 inline-flex gap-1">
      {[
        { id: 'tasks', label: 'My Tasks', icon: '📋' },
        { id: 'properties', label: 'Properties', icon: '🏢' },
        { id: 'permissions', label: 'Permissions', icon: '📄' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => nav(`/contractor/${tab.id === 'tasks' ? '' : tab.id}`)}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 ${
            activeTab === tab.id
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  // If showing properties or permissions tab, render those pages
  if (activeTab === 'properties') {
    return <PropertiesList />;
  }

  if (activeTab === 'permissions') {
    return <PermissionRequests />;
  }

  // Tasks Tab (original content)
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading tasks…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-12">

      {/* Toasts */}
      {(error || success) && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {error   && <div className="flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg"><span className="flex-1">⚠ {error}</span><button onClick={() => setError("")} className="opacity-70 hover:opacity-100 text-lg">&times;</button></div>}
          {success && <div className="bg-emerald-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">✓ {success}</div>}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-white p-8 shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.06] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, #818cf8, transparent)", transform: "translate(25%,-25%)" }} />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Worker Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">My Tasks</h1>
            <p className="text-sm text-slate-400 mt-1">Start work, upload photos, and mark tasks complete.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <TabNav />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total",     value: tasks.length,            color: "bg-white border-slate-200 text-slate-700" },
            { label: "Assigned",  value: statusCount("assigned"),  color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
            { label: "Started",   value: statusCount("started"),   color: "bg-violet-50 border-violet-100 text-violet-700" },
            { label: "Completed", value: statusCount("completed"), color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 shadow-sm ${s.color}`}>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-60">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Task List */}
        {tasks.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-slate-400 text-sm">No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {tasks.map((task) => {
              const photos = photoState[task._id] || {};
              const busy = uploading[task._id] || false;

              return (
                <div key={task._id} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">

                  {/* Task Header */}
                  <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-800">{task.complaint_id?.issue || "Assigned Task"}</h2>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <span className="text-xs text-slate-400">ID: #{task.complaint_id?._id?.slice(-6) || "—"}</span>
                        {task.complaint_id?.location && (
                          <span className="text-xs text-slate-400">📍 {task.complaint_id.location}</span>
                        )}
                        {task.complaint_id?.city && (
                          <span className="text-xs text-slate-400">🏙 {task.complaint_id.city}</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  <div className="px-6 py-5 space-y-5">

                    {/* Photo Upload — Before */}
                    {(task.status === "assigned" || task.status === "started") && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PhotoUpload
                          label="Before Photo"
                          existingUrl={task.before_photo}
                          preview={photos.beforePreview}
                          onFileSelect={(file) => handlePhotoSelect(task._id, "before", file)}
                        />
                        {task.status === "started" && (
                          <PhotoUpload
                            label="After Photo"
                            existingUrl={task.after_photo}
                            preview={photos.afterPreview}
                            onFileSelect={(file) => handlePhotoSelect(task._id, "after", file)}
                          />
                        )}
                      </div>
                    )}

                    {/* Existing photos (completed tasks) */}
                    {task.status === "completed" && (task.before_photo || task.after_photo) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {task.before_photo && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Before Photo</p>
                            <img src={task.before_photo} alt="Before" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
                          </div>
                        )}
                        {task.after_photo && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">After Photo</p>
                            <img src={task.after_photo} alt="After" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">

                      {/* Start Work — only when assigned */}
                      {task.status === "assigned" && (
                        <button
                          onClick={() => updateTask(task, "started")}
                          disabled={busy}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {busy ? "Updating…" : "▶ Start Work"}
                        </button>
                      )}

                      {/* Mark Complete — only when started */}
                      {task.status === "started" && (
                        <button
                          onClick={() => updateTask(task, "completed")}
                          disabled={busy}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {busy ? "Uploading…" : "✓ Mark Complete"}
                        </button>
                      )}

                      {/* Completed state — info only */}
                      {task.status === "completed" && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-emerald-600 font-semibold text-sm">✓ Done — Awaiting User Approval</span>
                        </div>
                      )}

                      {/* Save Photos without status change (when started) */}
                      {task.status === "started" && (photos.beforeFile || photos.afterFile) && (
                        <button
                          onClick={() => updateTask(task, "started")}
                          disabled={busy}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {busy ? "Saving…" : "💾 Save Photos"}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;