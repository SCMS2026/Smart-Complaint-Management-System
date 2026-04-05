import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWorkerTasks, updateWorkerTaskStatus } from "../services/workerTask";
import { updateComplaintStatusRequest } from "../services/complaints";

const ContractorDashboard = () => {
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    const res = await fetchWorkerTasks();
    if (res.success) {
      setTasks(res.workerTasks || []);
    } else {
      setError(res.message || "Failed to load tasks");
    }
    setLoading(false);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || (user.role !== "contractor" && user.role !== "worker")) {
      nav("/");
      return;
    }
    loadTasks();
  }, [nav]);

  const updateTask = async (task, newStatus) => {
    try {
      const taskRes = await updateWorkerTaskStatus(task._id, { status: newStatus });
      if (!taskRes.success) {
        setError(taskRes.message || "Unable to update task");
        return;
      }

      if (newStatus === "completed") {
        await updateComplaintStatusRequest(task.complaint_id._id, "waiting_user");
      } else if (newStatus === "started") {
        await updateComplaintStatusRequest(task.complaint_id._id, "in_progress");
      }

      loadTasks();
    } catch (err) {
      setError(err.message || "Operation failed");
    }
  };

  const statusCount = (status) => tasks.filter((task) => task.status === status).length;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-4xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 shadow-xl mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Contractor Workspace</p>
          <h1 className="mt-4 text-4xl font-bold">Contractor Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300 leading-7">Track assigned tasks, update status, and manage completion details in one place.</p>
        </div>

        {loading ? (
          <div className="rounded-[1.75rem] bg-white p-12 shadow-sm text-center text-slate-500">Loading tasks…</div>
        ) : error ? (
          <div className="rounded-[1.75rem] bg-white p-6 shadow-sm text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Assigned</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{statusCount("assigned")}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Started</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{statusCount("started")}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Completed</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{statusCount("completed")}</p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Total Tasks</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{tasks.length}</p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-[1.75rem] bg-white p-10 shadow-sm text-center text-slate-500">No tasks assigned yet.</div>
            ) : (
              <div className="grid gap-6">
                {tasks.map((task) => (
                  <div key={task._id} className="rounded-[1.75rem] bg-white p-6 shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">{task.complaint_id?.issue || "Assigned Task"}</h2>
                        <p className="text-sm text-slate-500">Complaint ID: {task.complaint_id?._id?.slice(-6)}</p>
                        <p className="text-sm text-slate-500">Location: {task.complaint_id?.location || "N/A"}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{task.status}</span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <button
                        className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                        onClick={() => updateTask(task, "started")}
                        disabled={task.status !== "assigned"}
                      >
                        Start Work
                      </button>
                      <button
                        className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
                        onClick={() => updateTask(task, "completed")}
                        disabled={task.status !== "started"}
                      >
                        Mark Complete
                      </button>
                      <button
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                        onClick={() => updateTask(task, "assigned")}
                        disabled={task.status === "assigned"}
                      >
                        Reset
                      </button>
                    </div>

                    {(task.before_photo || task.after_photo) && (
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {task.before_photo && (
                          <div>
                            <p className="text-sm text-slate-500 mb-2">Before photo</p>
                            <img src={task.before_photo} alt="Before" className="w-full h-48 object-cover rounded-2xl border border-slate-200" />
                          </div>
                        )}
                        {task.after_photo && (
                          <div>
                            <p className="text-sm text-slate-500 mb-2">After photo</p>
                            <img src={task.after_photo} alt="After" className="w-full h-48 object-cover rounded-2xl border border-slate-200" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;
